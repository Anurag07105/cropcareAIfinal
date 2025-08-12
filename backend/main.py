# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import explore,auth,community,help,predict# Import our explore routes

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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