## CropCareAI Deployment Guide

This guide explains how to run and deploy the CropCareAI project (backend + frontend + ML model).

---

## 1. Prerequisites

- Python 3.10+
- Node.js 18+ and npm
- PostgreSQL database
- Trained TensorFlow `.keras` model file
- Google Gemini API key
- (Optional) Twilio account for OTP login

---

## 2. Environment Configuration

1. Copy the example env file:

```bash
cp .env.example .env
```

2. Edit `.env` and set:

- `DATABASE_URL` – PostgreSQL connection string, e.g.  
  `postgresql+psycopg2://user:password@host:5432/cropcare`
- `MODEL_PATH` – absolute path to `mobilenetv2_cropcare.keras`  
  (or place the file at `backend/model/mobilenetv2_cropcare.keras` and omit this).
- `GEMINI_API_KEY` – your Google Gemini API key.
- `TWILIO_*` – Twilio credentials if you want OTP login.
- `VITE_API_URL` – base URL of the backend (for frontend), e.g. `http://localhost:8000`.
- `FRONTEND_ORIGIN` – frontend origin (for backend CORS), e.g. `http://localhost:5173` or your deployed URL.

---

## 3. Backend – Local Run

From the project root:

```bash
pip install -r requirements.txt
cd backend
```

Create database tables (one-time, e.g. in a simple script or shell):

```python
# create_tables.py
from database import Base, engine
from database import models

Base.metadata.create_all(bind=engine)
```

Run:

```bash
python create_tables.py
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

The backend will be available at `http://localhost:8000`.

Health checks:

- `GET /` – backend alive
- `GET /predict/health` – model + Gemini health
- `GET /explore/health` – chatbot health
- `GET /auth/health` – Twilio health

---

## 4. Frontend – Local Run

From the project root, navigate to the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

Ensure `VITE_API_URL` in `.env` (at the root) matches your backend URL (e.g. `http://localhost:8000`).

The frontend will be available at `http://localhost:8080`.

---

## 5. Deployment Options

### 5.1 Render / Railway (recommended for PaaS)

**Backend**

1. Create a new Web Service from this repo.
2. Set build & run commands:
   - Build: `pip install -r requirements.txt`
   - Run: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
3. Configure environment variables in the dashboard:
   - `DATABASE_URL`, `MODEL_PATH`, `GEMINI_API_KEY`, `TWILIO_*`, `FRONTEND_ORIGIN`.
4. Ensure your `.keras` model file is either:
   - Bundled in the repo under `backend/model/`, or
   - Mounted from cloud storage and referenced via `MODEL_PATH`.

**Frontend**

1. Create a static site service.
2. Build command: `cd frontend && npm install && npm run build`
3. Publish directory: `frontend/dist`
4. Set `VITE_API_URL` to the public URL of your backend.

### 5.2 AWS / GCP

- Package backend as a container:

  ```bash
  docker build -t cropcare-backend -f Dockerfile.backend .
  docker run -p 8000:8000 --env-file .env cropcare-backend
  ```

- Deploy container to:
  - AWS: ECS/Fargate, App Runner, or Elastic Beanstalk
  - GCP: Cloud Run

- Serve frontend via:
  - AWS S3 + CloudFront
  - GCP Cloud Storage + Cloud CDN

Ensure:

- `VITE_API_URL` points to the backend service URL.
- `FRONTEND_ORIGIN` in backend env matches your frontend domain.

---

## 6. Production Checklist

- [ ] `DATABASE_URL` points to a managed PostgreSQL instance.
- [ ] `MODEL_PATH` is valid and readable by the backend.
- [ ] `GEMINI_API_KEY` set and tested via `/explore/health`.
- [ ] Twilio credentials set (or feature disabled if not needed).
- [ ] CORS configured correctly (`FRONTEND_ORIGIN`).
- [ ] HTTPS enabled on frontend and backend.
- [ ] Error logs monitored (e.g., via platform logging).

