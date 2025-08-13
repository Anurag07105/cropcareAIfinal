# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import explore,auth,community,help,predict# Import our explore routes

app = FastAPI( title="CropCareAI Backend",
    description="Backend API for CropCareAI project - disease detection, community, and AI support",
    version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[ "http://localhost:8080",        # Vite dev
        "https://cropcare-a-ifinal-dc2jve9l2-anurag07105s-projects.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include  routes
app.include_router(explore.router, prefix="/explore", tags=["Explore"])
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(community.router, prefix="/community", tags=["Community"])
app.include_router(help.router, prefix="/help", tags=["Help & Support"])
app.include_router(predict.router, prefix="/predict", tags=["Predict"])



@app.get("/")
def root():
    return {"message": "CropCare AI Backend is running!"}
