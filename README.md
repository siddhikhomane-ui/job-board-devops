
💼 CareerMatch 🚀

AI-Powered Job Board & Recruitment Platform

CareerMatch is a full-stack job board platform that connects **job seekers**, **recruiters**, and **admins** with intelligent features like **AI skill-gap analysis**, **resume scoring**, and **smart job recommendations**.

---

🏗️ Architecture Overview

```
job-board-system-project/
├── backend/
│   ├── server.py                 # FastAPI main server
│   ├── requirements.txt          # Python dependencies
│   ├── .env                      # Environment variables
│   ├── database/                 # MongoDB connection logic
│   ├── models/                   # Pydantic models
│   ├── routes/                   # API routes
│   └── utils/                    # JWT, hashing, helpers
│
├── frontend/
│   ├── src/
│   │   ├── pages/                # Pages (Login, Register, Dashboard)
│   │   ├── components/           # Reusable UI components
│   │   ├── contexts/             # Auth context
│   │   ├── lib/                  # API config (Axios)
│   │   └── App.js                # Main app
│   ├── package.json              # Dependencies
│   └── .env                      # Frontend config
│
└── README.md
```

---

## 🚀 Setup Instructions

📌 Prerequisites

* Python 3.10+
* Node.js 18+
* MongoDB (local or Atlas)
* Git

---

## 🔧 Backend Setup

### Step 1 — Navigate to backend

```bash
cd backend
```

---

### Step 2 — Create virtual environment

```bash
python -m venv venv
```

---

### Step 3 — Activate environment

```bash
venv\Scripts\activate
```

---

### Step 4 — Install dependencies

```bash
pip install -r requirements.txt
```

---

### Step 5 — Setup environment variables

Create `.env` file:

```
MONGO_URL=mongodb://localhost:27017
DB_NAME=jobboard
JWT_SECRET=supersecretkey12345678901234567890
```

---

### Step 6 — Run backend

```bash
uvicorn server:app --reload
```

👉 Backend runs at:

```
http://127.0.0.1:8000
```

---

## 🎨 Frontend Setup

### Step 1 — Navigate to frontend

```bash
cd frontend
```

---

### Step 2 — Install dependencies

```bash
npm install
```

---

### Step 3 — Fix Node compatibility issue

```bash
npm install ajv@8 ajv-keywords@5
```

---

### Step 4 — Setup environment variables

Create `.env` file:

```
REACT_APP_BACKEND_URL=http://127.0.0.1:8000
```

---

### Step 5 — Run frontend

```bash
npm start
```

👉 Frontend runs at:

```
http://localhost:3000
```

---

🤖 AI Features

CareerMatch includes intelligent features to improve hiring outcomes.

🧠 Skill Gap Analysis

Compares:

* User skills
* Job requirements

Outputs:

* Matching skills
* Missing skills
* Suggestions

---

📊 Resume Scoring Formula

```
Score = (Matching Skills / Total Required Skills) × 100
```

---

🔍 Smart Recommendations

* Suggests jobs based on user skills
* Sorts by highest match percentage

---

🗄️ Database Structure (MongoDB)

```
/users/{userId}
  name, email, password_hash, role, skills,
  bio, experience, education, created_at

/jobs/{jobId}
  title, company, location, salary_min, salary_max,
  description, skills_required, job_type,
  experience_level, posted_by, created_at

/applications/{applicationId}
  job_id, applicant_id, status,
  resume_score, cover_letter, created_at

/referrals/{referralId}
  referrer_id, referred_email, job_id,
  status, created_at
```


🔐 User Roles & Flows

👤 Job Seeker Flow

1. Register/Login
2. Add skills
3. Browse jobs
4. Apply to jobs
5. Track applications
6. Analyze skill gaps

---

🏢 Recruiter Flow

1. Login
2. Create job postings
3. View applicants
4. Update application status

---

🛡️ Admin Flow

1. Manage users
2. View analytics
3. Monitor system activity

---

 📊 Analytics

Seeker Analytics

* Total applications
* Success rate

 Recruiter Analytics

* Total jobs
* Applicants count

Admin Analytics

* Users count
* Jobs count
* Applications count

---

🔔 Notifications (Planned)

| Event            | Notification       |
| ---------------- | ------------------ |
| Job applied      | Recruiter notified |
| Status update    | User notified      |
| Referral created | Email notification |

---

🛡️ Security Highlights

* JWT Authentication
* Password hashing (bcrypt)
* Role-based access control
* Protected API routes

---

📱 Supported Platforms

| Platform | Status         |
| -------- | -------------- |
| Web      | ✅ Full support |
| Mobile   | ⚠️ Planned     |

---

🧪 Testing

* API testing via Swagger UI
* Frontend tested with manual flows

👉 API Docs:

```
http://127.0.0.1:8000/docs
```


📦 Key Dependencies

### Backend

* FastAPI
* Motor (MongoDB async)
* PyJWT
* bcrypt

### Frontend

* React
* Axios
* Tailwind CSS
* React Router

---

🚢 Production Checklist

* [ ] Replace `.env` with secure values
* [ ] Use MongoDB Atlas
* [ ] Enable HTTPS
* [ ] Deploy backend (Render / Railway)
* [ ] Deploy frontend (Vercel)
* [ ] Add logging & monitoring
* [ ] Implement email notifications

---

🚀 Future Enhancements

* Resume upload & parsing
* Real-time chat system
* Email notifications
* AI interview preparation
* Docker deployment

---

📄 License

MIT License — free to use and modify

---

🙌 Acknowledgements

* FastAPI
* React
* MongoDB

---

⭐ Support

If you like this project:
👉 Give it a ⭐ on GitHub
