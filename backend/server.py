from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import logging
import bcrypt
import jwt
import secrets
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_ALGORITHM = "HS256"

def get_jwt_secret():
    return os.environ["JWT_SECRET"]

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(minutes=60), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Pydantic Models
class RegisterInput(BaseModel):
    name: str
    email: str
    password: str
    role: str = "seeker"
    skills: List[str] = []

class LoginInput(BaseModel):
    email: str
    password: str

class JobCreate(BaseModel):
    title: str
    company: str
    location: str
    salary_min: int = 0
    salary_max: int = 0
    description: str
    requirements: List[str] = []
    skills_required: List[str] = []
    job_type: str = "full-time"
    experience_level: str = "entry"

class JobUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    description: Optional[str] = None
    requirements: Optional[List[str]] = None
    skills_required: Optional[List[str]] = None
    job_type: Optional[str] = None
    experience_level: Optional[str] = None
    is_active: Optional[bool] = None

class ApplicationCreate(BaseModel):
    job_id: str
    cover_letter: str = ""

class ApplicationStatusUpdate(BaseModel):
    status: str

class ReferralCreate(BaseModel):
    referred_email: str
    referred_name: str
    job_id: Optional[str] = None
    message: str = ""

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    skills: Optional[List[str]] = None
    bio: Optional[str] = None
    experience: Optional[str] = None
    education: Optional[str] = None
    resume_url: Optional[str] = None

class SkillGapInput(BaseModel):
    job_id: str

# App
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ---- AUTH ENDPOINTS ----
@api_router.post("/auth/register")
async def register(input: RegisterInput, response: Response):
    email = input.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    if input.role not in ["seeker", "recruiter", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    user_doc = {
        "name": input.name,
        "email": email,
        "password_hash": hash_password(input.password),
        "role": input.role,
        "skills": input.skills,
        "bio": "",
        "experience": "",
        "education": "",
        "resume_url": "",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    return {"id": user_id, "name": input.name, "email": email, "role": input.role, "skills": input.skills, "token": access_token}

@api_router.post("/auth/login")
async def login(input: LoginInput, request: Request, response: Response):
    email = input.email.lower().strip()
    ip = request.client.host if request.client else "unknown"
    identifier = f"{ip}:{email}"
    # Brute force check
    attempt = await db.login_attempts.find_one({"identifier": identifier})
    if attempt and attempt.get("count", 0) >= 5:
        lockout_until = attempt.get("locked_until")
        if lockout_until and datetime.now(timezone.utc).isoformat() < lockout_until:
            raise HTTPException(status_code=429, detail="Too many attempts. Try again in 15 minutes.")
        else:
            await db.login_attempts.delete_one({"identifier": identifier})
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(input.password, user["password_hash"]):
        # Increment failed attempts
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$inc": {"count": 1}, "$set": {"locked_until": (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()}},
            upsert=True
        )
        raise HTTPException(status_code=401, detail="Invalid email or password")
    # Clear attempts on success
    await db.login_attempts.delete_many({"identifier": identifier})
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    return {"id": user_id, "name": user["name"], "email": email, "role": user["role"], "skills": user.get("skills", []), "token": access_token}

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out"}

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    return user

@api_router.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user_id = str(user["_id"])
        new_access = create_access_token(user_id, user["email"])
        response.set_cookie(key="access_token", value=new_access, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
        return {"message": "Token refreshed"}
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

# ---- JOB ENDPOINTS ----
@api_router.post("/jobs")
async def create_job(job: JobCreate, request: Request):
    user = await get_current_user(request)
    if user["role"] not in ["recruiter", "admin"]:
        raise HTTPException(status_code=403, detail="Only recruiters can post jobs")
    job_doc = {
        **job.model_dump(),
        "posted_by": user["_id"],
        "posted_by_name": user["name"],
        "is_active": True,
        "applicant_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await db.jobs.insert_one(job_doc)
    job_doc["id"] = str(result.inserted_id)
    job_doc.pop("_id", None)
    return job_doc

@api_router.get("/jobs")
async def get_jobs(
    search: str = "",
    location: str = "",
    skills: str = "",
    job_type: str = "",
    experience_level: str = "",
    salary_min: int = 0,
    salary_max: int = 0,
    page: int = 1,
    limit: int = 20
):
    query = {"is_active": True}
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"company": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    if skills:
        skill_list = [s.strip() for s in skills.split(",")]
        query["skills_required"] = {"$in": skill_list}
    if job_type:
        query["job_type"] = job_type
    if experience_level:
        query["experience_level"] = experience_level
    if salary_min > 0:
        query["salary_max"] = {"$gte": salary_min}
    if salary_max > 0:
        query["salary_min"] = {"$lte": salary_max}
    skip = (page - 1) * limit
    total = await db.jobs.count_documents(query)
    jobs = await db.jobs.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    result = []
    for j in jobs:
        j["id"] = str(j["_id"])
        j.pop("_id", None)
        result.append(j)
    return {"jobs": result, "total": total, "page": page, "pages": (total + limit - 1) // limit}

@api_router.get("/jobs/{job_id}")
async def get_job(job_id: str):
    try:
        job = await db.jobs.find_one({"_id": ObjectId(job_id)})
    except Exception:
        raise HTTPException(status_code=404, detail="Job not found")
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job["id"] = str(job["_id"])
    job.pop("_id", None)
    return job

@api_router.put("/jobs/{job_id}")
async def update_job(job_id: str, job_update: JobUpdate, request: Request):
    user = await get_current_user(request)
    if user["role"] not in ["recruiter", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    update_data = {k: v for k, v in job_update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    await db.jobs.update_one({"_id": ObjectId(job_id)}, {"$set": update_data})
    job = await db.jobs.find_one({"_id": ObjectId(job_id)})
    job["id"] = str(job["_id"])
    job.pop("_id", None)
    return job

@api_router.delete("/jobs/{job_id}")
async def delete_job(job_id: str, request: Request):
    user = await get_current_user(request)
    if user["role"] not in ["recruiter", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    await db.jobs.delete_one({"_id": ObjectId(job_id)})
    return {"message": "Job deleted"}

@api_router.get("/jobs/recruiter/mine")
async def get_my_jobs(request: Request):
    user = await get_current_user(request)
    if user["role"] not in ["recruiter", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    jobs = await db.jobs.find({"posted_by": user["_id"]}).sort("created_at", -1).to_list(100)
    result = []
    for j in jobs:
        j["id"] = str(j["_id"])
        j.pop("_id", None)
        result.append(j)
    return result

# ---- APPLICATION ENDPOINTS ----
@api_router.post("/applications")
async def apply_to_job(app_input: ApplicationCreate, request: Request):
    user = await get_current_user(request)
    if user["role"] != "seeker":
        raise HTTPException(status_code=403, detail="Only job seekers can apply")
    # Check if already applied
    existing = await db.applications.find_one({"job_id": app_input.job_id, "applicant_id": user["_id"]})
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this job")
    job = await db.jobs.find_one({"_id": ObjectId(app_input.job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    # Calculate resume score
    user_skills = set(s.lower() for s in user.get("skills", []))
    job_skills = set(s.lower() for s in job.get("skills_required", []))
    if job_skills:
        match_count = len(user_skills & job_skills)
        resume_score = int((match_count / len(job_skills)) * 100)
    else:
        resume_score = 50
    app_doc = {
        "job_id": app_input.job_id,
        "job_title": job.get("title", ""),
        "company": job.get("company", ""),
        "applicant_id": user["_id"],
        "applicant_name": user["name"],
        "applicant_email": user["email"],
        "cover_letter": app_input.cover_letter,
        "status": "applied",
        "resume_score": resume_score,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await db.applications.insert_one(app_doc)
    await db.jobs.update_one({"_id": ObjectId(app_input.job_id)}, {"$inc": {"applicant_count": 1}})
    app_doc["id"] = str(result.inserted_id)
    app_doc.pop("_id", None)
    return app_doc

@api_router.get("/applications/mine")
async def get_my_applications(request: Request):
    user = await get_current_user(request)
    apps = await db.applications.find({"applicant_id": user["_id"]}).sort("created_at", -1).to_list(100)
    result = []
    for a in apps:
        a["id"] = str(a["_id"])
        a.pop("_id", None)
        result.append(a)
    return result

@api_router.get("/applications/job/{job_id}")
async def get_job_applications(job_id: str, request: Request):
    user = await get_current_user(request)
    if user["role"] not in ["recruiter", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    apps = await db.applications.find({"job_id": job_id}).sort("created_at", -1).to_list(100)
    result = []
    for a in apps:
        a["id"] = str(a["_id"])
        a.pop("_id", None)
        result.append(a)
    return result

@api_router.put("/applications/{app_id}/status")
async def update_application_status(app_id: str, status_update: ApplicationStatusUpdate, request: Request):
    user = await get_current_user(request)
    if user["role"] not in ["recruiter", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    if status_update.status not in ["applied", "shortlisted", "rejected", "hired"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    await db.applications.update_one({"_id": ObjectId(app_id)}, {"$set": {"status": status_update.status}})
    return {"message": "Status updated"}

# ---- REFERRAL ENDPOINTS ----
@api_router.post("/referrals")
async def create_referral(ref: ReferralCreate, request: Request):
    user = await get_current_user(request)
    ref_doc = {
        "referrer_id": user["_id"],
        "referrer_name": user["name"],
        "referrer_email": user["email"],
        "referred_email": ref.referred_email.lower(),
        "referred_name": ref.referred_name,
        "job_id": ref.job_id,
        "message": ref.message,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await db.referrals.insert_one(ref_doc)
    ref_doc["id"] = str(result.inserted_id)
    ref_doc.pop("_id", None)
    return ref_doc

@api_router.get("/referrals/mine")
async def get_my_referrals(request: Request):
    user = await get_current_user(request)
    refs = await db.referrals.find({"referrer_id": user["_id"]}).sort("created_at", -1).to_list(100)
    result = []
    for r in refs:
        r["id"] = str(r["_id"])
        r.pop("_id", None)
        result.append(r)
    return result

# ---- PROFILE ENDPOINTS ----
@api_router.put("/profile")
async def update_profile(profile: ProfileUpdate, request: Request):
    user = await get_current_user(request)
    update_data = {k: v for k, v in profile.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    await db.users.update_one({"_id": ObjectId(user["_id"])}, {"$set": update_data})
    updated = await db.users.find_one({"_id": ObjectId(user["_id"])}, {"password_hash": 0})
    updated["_id"] = str(updated["_id"])
    return updated

@api_router.get("/profile")
async def get_profile(request: Request):
    user = await get_current_user(request)
    return user

# ---- ANALYTICS ENDPOINTS ----
@api_router.get("/analytics/seeker")
async def seeker_analytics(request: Request):
    user = await get_current_user(request)
    total_apps = await db.applications.count_documents({"applicant_id": user["_id"]})
    applied = await db.applications.count_documents({"applicant_id": user["_id"], "status": "applied"})
    shortlisted = await db.applications.count_documents({"applicant_id": user["_id"], "status": "shortlisted"})
    rejected = await db.applications.count_documents({"applicant_id": user["_id"], "status": "rejected"})
    hired = await db.applications.count_documents({"applicant_id": user["_id"], "status": "hired"})
    return {
        "total_applications": total_apps,
        "applied": applied,
        "shortlisted": shortlisted,
        "rejected": rejected,
        "hired": hired,
        "success_rate": round((shortlisted + hired) / total_apps * 100, 1) if total_apps > 0 else 0
    }

@api_router.get("/analytics/recruiter")
async def recruiter_analytics(request: Request):
    user = await get_current_user(request)
    total_jobs = await db.jobs.count_documents({"posted_by": user["_id"]})
    active_jobs = await db.jobs.count_documents({"posted_by": user["_id"], "is_active": True})
    # Get all job ids by this recruiter
    jobs = await db.jobs.find({"posted_by": user["_id"]}, {"_id": 1}).to_list(1000)
    job_ids = [str(j["_id"]) for j in jobs]
    total_applicants = await db.applications.count_documents({"job_id": {"$in": job_ids}})
    shortlisted = await db.applications.count_documents({"job_id": {"$in": job_ids}, "status": "shortlisted"})
    return {
        "total_jobs": total_jobs,
        "active_jobs": active_jobs,
        "total_applicants": total_applicants,
        "shortlisted": shortlisted,
    }

@api_router.get("/analytics/admin")
async def admin_analytics(request: Request):
    user = await get_current_user(request)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    total_users = await db.users.count_documents({})
    total_seekers = await db.users.count_documents({"role": "seeker"})
    total_recruiters = await db.users.count_documents({"role": "recruiter"})
    total_jobs = await db.jobs.count_documents({})
    total_apps = await db.applications.count_documents({})
    total_referrals = await db.referrals.count_documents({})
    return {
        "total_users": total_users,
        "total_seekers": total_seekers,
        "total_recruiters": total_recruiters,
        "total_jobs": total_jobs,
        "total_applications": total_apps,
        "total_referrals": total_referrals,
    }

# ---- ADMIN ENDPOINTS ----
@api_router.get("/admin/users")
async def get_all_users(request: Request):
    user = await get_current_user(request)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    users = await db.users.find({}, {"password_hash": 0}).to_list(1000)
    result = []
    for u in users:
        u["_id"] = str(u["_id"])
        result.append(u)
    return result

@api_router.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, request: Request):
    user = await get_current_user(request)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    await db.users.delete_one({"_id": ObjectId(user_id)})
    return {"message": "User deleted"}

@api_router.get("/admin/jobs")
async def admin_get_all_jobs(request: Request):
    user = await get_current_user(request)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    jobs = await db.jobs.find({}).sort("created_at", -1).to_list(1000)
    result = []
    for j in jobs:
        j["id"] = str(j["_id"])
        j.pop("_id", None)
        result.append(j)
    return result

# ---- SKILL GAP ANALYZER (AI) ----
@api_router.post("/skills/analyze")
async def analyze_skill_gap(input: SkillGapInput, request: Request):
    user = await get_current_user(request)
    job = await db.jobs.find_one({"_id": ObjectId(input.job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    user_skills = user.get("skills", [])
    job_skills = job.get("skills_required", [])
    matching = [s for s in user_skills if s.lower() in [js.lower() for js in job_skills]]
    missing = [s for s in job_skills if s.lower() not in [us.lower() for us in user_skills]]
    score = int((len(matching) / len(job_skills)) * 100) if job_skills else 100
    # Try AI analysis
    ai_suggestions = []
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        llm_key = os.environ.get("EMERGENT_LLM_KEY", "")
        if llm_key:
            chat = LlmChat(
                api_key=llm_key,
                session_id=f"skillgap-{user['_id']}-{input.job_id}",
                system_message="You are a career advisor. Provide brief, actionable suggestions for learning missing skills. Return a JSON array of objects with 'skill' and 'suggestion' keys. Only return the JSON array, no markdown."
            ).with_model("openai", "gpt-5.2")
            prompt = f"User skills: {', '.join(user_skills)}. Job requires: {', '.join(job_skills)}. Missing skills: {', '.join(missing)}. For each missing skill, suggest a brief learning path (1-2 sentences)."
            response = await chat.send_message(UserMessage(text=prompt))
            import json
            try:
                ai_suggestions = json.loads(response)
            except Exception:
                ai_suggestions = [{"skill": s, "suggestion": f"Learn {s} through online courses and practice projects"} for s in missing]
    except Exception as e:
        logger.warning(f"AI skill analysis failed: {e}")
        ai_suggestions = [{"skill": s, "suggestion": f"Learn {s} through online courses and practice projects"} for s in missing]
    return {
        "job_title": job.get("title", ""),
        "matching_skills": matching,
        "missing_skills": missing,
        "score": score,
        "suggestions": ai_suggestions,
    }

# ---- SMART RECOMMENDATIONS ----
@api_router.get("/jobs/recommendations/smart")
async def get_smart_recommendations(request: Request):
    user = await get_current_user(request)
    user_skills = user.get("skills", [])
    if not user_skills:
        # Return latest jobs if no skills
        jobs = await db.jobs.find({"is_active": True}).sort("created_at", -1).limit(10).to_list(10)
        result = []
        for j in jobs:
            j["id"] = str(j["_id"])
            j.pop("_id", None)
            j["match_score"] = 0
            result.append(j)
        return result
    # Find jobs matching user skills
    jobs = await db.jobs.find({
        "is_active": True,
        "skills_required": {"$in": user_skills}
    }).to_list(100)
    scored = []
    for j in jobs:
        job_skills = set(s.lower() for s in j.get("skills_required", []))
        u_skills = set(s.lower() for s in user_skills)
        match_count = len(job_skills & u_skills)
        match_score = int((match_count / len(job_skills)) * 100) if job_skills else 0
        j["id"] = str(j["_id"])
        j.pop("_id", None)
        j["match_score"] = match_score
        scored.append(j)
    scored.sort(key=lambda x: x["match_score"], reverse=True)
    return scored[:10]

# ---- SEED DATA ----
async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@jobboard.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin",
            "role": "admin",
            "skills": [],
            "bio": "Platform Administrator",
            "experience": "",
            "education": "",
            "resume_url": "",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Admin user seeded: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info("Admin password updated")

async def seed_sample_data():
    job_count = await db.jobs.count_documents({})
    if job_count > 0:
        return
    # Create sample recruiter
    recruiter_email = "recruiter@techcorp.com"
    existing_rec = await db.users.find_one({"email": recruiter_email})
    if not existing_rec:
        rec_result = await db.users.insert_one({
            "email": recruiter_email,
            "password_hash": hash_password("recruiter123"),
            "name": "Sarah Johnson",
            "role": "recruiter",
            "skills": [],
            "bio": "Tech Recruiter at TechCorp",
            "experience": "5 years",
            "education": "MBA",
            "resume_url": "",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        recruiter_id = str(rec_result.inserted_id)
    else:
        recruiter_id = str(existing_rec["_id"])
    # Create sample seeker
    seeker_email = "seeker@demo.com"
    existing_seek = await db.users.find_one({"email": seeker_email})
    if not existing_seek:
        await db.users.insert_one({
            "email": seeker_email,
            "password_hash": hash_password("seeker123"),
            "name": "Alex Chen",
            "role": "seeker",
            "skills": ["Python", "React", "JavaScript", "SQL", "Git"],
            "bio": "Full-stack developer looking for new opportunities",
            "experience": "2 years",
            "education": "BS Computer Science",
            "resume_url": "",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    sample_jobs = [
        {"title": "Senior Frontend Developer", "company": "TechCorp", "location": "San Francisco, CA", "salary_min": 120000, "salary_max": 160000, "description": "We're looking for an experienced frontend developer to join our team. You'll work on building modern web applications using React and TypeScript. The ideal candidate has 5+ years of experience and a passion for creating beautiful, responsive user interfaces.", "requirements": ["5+ years experience", "Strong portfolio", "Team leadership"], "skills_required": ["React", "TypeScript", "CSS", "HTML", "Redux"], "job_type": "full-time", "experience_level": "senior", "posted_by": recruiter_id, "posted_by_name": "Sarah Johnson", "is_active": True, "applicant_count": 0, "created_at": datetime.now(timezone.utc).isoformat()},
        {"title": "Python Backend Engineer", "company": "DataFlow Inc", "location": "New York, NY", "salary_min": 110000, "salary_max": 150000, "description": "Join our backend team to build scalable APIs and microservices. You'll work with Python, FastAPI, and cloud technologies to power our data platform.", "requirements": ["3+ years Python experience", "API design skills", "Cloud experience"], "skills_required": ["Python", "FastAPI", "PostgreSQL", "Docker", "AWS"], "job_type": "full-time", "experience_level": "mid", "posted_by": recruiter_id, "posted_by_name": "Sarah Johnson", "is_active": True, "applicant_count": 0, "created_at": datetime.now(timezone.utc).isoformat()},
        {"title": "Full Stack Developer", "company": "StartupXYZ", "location": "Remote", "salary_min": 90000, "salary_max": 130000, "description": "We're a fast-growing startup looking for a full-stack developer. You'll wear many hats and build features end-to-end using React and Node.js.", "requirements": ["2+ years experience", "Startup mindset", "Full-stack skills"], "skills_required": ["React", "Node.js", "MongoDB", "JavaScript", "Git"], "job_type": "full-time", "experience_level": "mid", "posted_by": recruiter_id, "posted_by_name": "Sarah Johnson", "is_active": True, "applicant_count": 0, "created_at": datetime.now(timezone.utc).isoformat()},
        {"title": "DevOps Engineer", "company": "CloudNine Systems", "location": "Austin, TX", "salary_min": 130000, "salary_max": 170000, "description": "Design and maintain our cloud infrastructure. You'll work with Kubernetes, Terraform, and CI/CD pipelines to ensure reliable deployments.", "requirements": ["4+ years DevOps experience", "Kubernetes certification preferred"], "skills_required": ["AWS", "Kubernetes", "Docker", "Terraform", "Linux"], "job_type": "full-time", "experience_level": "senior", "posted_by": recruiter_id, "posted_by_name": "Sarah Johnson", "is_active": True, "applicant_count": 0, "created_at": datetime.now(timezone.utc).isoformat()},
        {"title": "Data Scientist", "company": "AI Labs", "location": "Boston, MA", "salary_min": 100000, "salary_max": 140000, "description": "Apply machine learning and statistical methods to solve real-world problems. You'll work with large datasets and build predictive models.", "requirements": ["MS/PhD in relevant field", "ML experience", "Published research preferred"], "skills_required": ["Python", "TensorFlow", "SQL", "Statistics", "Machine Learning"], "job_type": "full-time", "experience_level": "mid", "posted_by": recruiter_id, "posted_by_name": "Sarah Johnson", "is_active": True, "applicant_count": 0, "created_at": datetime.now(timezone.utc).isoformat()},
        {"title": "UI/UX Designer", "company": "DesignHub", "location": "Los Angeles, CA", "salary_min": 85000, "salary_max": 120000, "description": "Create beautiful and intuitive user experiences. You'll work closely with product and engineering teams to design web and mobile interfaces.", "requirements": ["3+ years design experience", "Figma proficiency", "Portfolio required"], "skills_required": ["Figma", "UI Design", "User Research", "Prototyping", "CSS"], "job_type": "full-time", "experience_level": "mid", "posted_by": recruiter_id, "posted_by_name": "Sarah Johnson", "is_active": True, "applicant_count": 0, "created_at": datetime.now(timezone.utc).isoformat()},
        {"title": "Junior React Developer", "company": "WebWorks", "location": "Chicago, IL", "salary_min": 60000, "salary_max": 80000, "description": "Great opportunity for a junior developer to learn and grow. You'll build React components and work alongside senior developers.", "requirements": ["0-2 years experience", "CS degree or bootcamp", "Eagerness to learn"], "skills_required": ["React", "JavaScript", "HTML", "CSS", "Git"], "job_type": "full-time", "experience_level": "entry", "posted_by": recruiter_id, "posted_by_name": "Sarah Johnson", "is_active": True, "applicant_count": 0, "created_at": datetime.now(timezone.utc).isoformat()},
        {"title": "Mobile Developer (React Native)", "company": "AppVenture", "location": "Seattle, WA", "salary_min": 100000, "salary_max": 140000, "description": "Build cross-platform mobile applications using React Native. You'll create smooth, native-like experiences for iOS and Android.", "requirements": ["3+ years mobile development", "Published apps preferred"], "skills_required": ["React Native", "JavaScript", "TypeScript", "iOS", "Android"], "job_type": "full-time", "experience_level": "mid", "posted_by": recruiter_id, "posted_by_name": "Sarah Johnson", "is_active": True, "applicant_count": 0, "created_at": datetime.now(timezone.utc).isoformat()},
    ]
    await db.jobs.insert_many(sample_jobs)
    logger.info(f"Seeded {len(sample_jobs)} sample jobs")

@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.applications.create_index([("job_id", 1), ("applicant_id", 1)])
    await seed_admin()
    await seed_sample_data()
    # Write test credentials
    os.makedirs("/app/memory", exist_ok=True)
    with open("/app/memory/test_credentials.md", "w") as f:
        f.write("# Test Credentials\n\n")
        f.write("## Admin\n- Email: admin@jobboard.com\n- Password: admin123\n- Role: admin\n\n")
        f.write("## Recruiter\n- Email: recruiter@techcorp.com\n- Password: recruiter123\n- Role: recruiter\n\n")
        f.write("## Job Seeker\n- Email: seeker@demo.com\n- Password: seeker123\n- Role: seeker\n\n")
        f.write("## Auth Endpoints\n- POST /api/auth/register\n- POST /api/auth/login\n- POST /api/auth/logout\n- GET /api/auth/me\n- POST /api/auth/refresh\n")

app.include_router(api_router)

cors_origins_raw = os.environ.get('CORS_ORIGINS', 'http://localhost:3000')
cors_origins = [origin.strip() for origin in cors_origins_raw.split(',') if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
