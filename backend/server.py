from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import logging
import bcrypt
import jwt
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone, timedelta

# -------------------- LOGGING --------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# -------------------- ENV VARIABLES (SAFE) --------------------
MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongo:27017")
DB_NAME = os.getenv("DB_NAME", "jobboard")
JWT_SECRET = os.getenv("JWT_SECRET", "dev_secret_key")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000")

# -------------------- DATABASE --------------------
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

JWT_ALGORITHM = "HS256"

# -------------------- AUTH HELPERS --------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_access_token(user_id: str, email: str):
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=60),
        "type": "access"
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str):
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "refresh"
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")

# -------------------- MODELS --------------------
class RegisterInput(BaseModel):
    name: str
    email: str
    password: str

class LoginInput(BaseModel):
    email: str
    password: str

class JobCreate(BaseModel):
    title: str
    company: str
    location: str
    description: str

# -------------------- APP --------------------
app = FastAPI()
api = APIRouter(prefix="/api")

# -------------------- AUTH --------------------
@api.post("/auth/register")
async def register(data: RegisterInput, response: Response):
    email = data.email.lower()

    if await db.users.find_one({"email": email}):
        raise HTTPException(400, "Email exists")

    user = {
        "name": data.name,
        "email": email,
        "password_hash": hash_password(data.password),
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    result = await db.users.insert_one(user)
    user_id = str(result.inserted_id)

    token = create_access_token(user_id, email)

    response.set_cookie("access_token", token, httponly=True)

    return {"id": user_id, "token": token}

@api.post("/auth/login")
async def login(data: LoginInput, response: Response):
    email = data.email.lower()

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(401, "Invalid credentials")

    user_id = str(user["_id"])
    token = create_access_token(user_id, email)

    response.set_cookie("access_token", token, httponly=True)

    return {"id": user_id, "token": token}

@api.get("/auth/me")
async def me(request: Request):
    return await get_current_user(request)

# -------------------- JOBS --------------------
@api.post("/jobs")
async def create_job(job: JobCreate, request: Request):
    user = await get_current_user(request)

    job_doc = {
        **job.model_dump(),
        "posted_by": user["_id"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    result = await db.jobs.insert_one(job_doc)
    job_doc["id"] = str(result.inserted_id)

    return job_doc

@api.get("/jobs")
async def get_jobs():
    jobs = await db.jobs.find().to_list(100)

    for j in jobs:
        j["id"] = str(j["_id"])
        j.pop("_id", None)

    return jobs

# -------------------- STARTUP --------------------
@app.on_event("startup")
async def startup():
    logger.info("🚀 Backend started successfully")

# -------------------- SHUTDOWN --------------------
@app.on_event("shutdown")
async def shutdown():
    client.close()
    logger.info("🛑 Backend stopped")

# -------------------- ROUTER --------------------
app.include_router(api)

# -------------------- CORS --------------------
origins = [o.strip() for o in CORS_ORIGINS.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)