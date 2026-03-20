from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db.database import Base, engine
from app.models import *
from app.routes.feedback_endpoints import router as feedback_router
from app.routes.interviewee_endpoints import router as interviewee_router
from app.routes.interview_ws import router as interview_ws_router
from app.routes.question_bank_endpoints import router as question_bank_router
from app.routes.question_endpoints import router as question_router
from app.routes.response_endpoints import router as response_router
from app.routes.sandbox_endpoints import router as sandbox_router
from app.routes.session_endpoints import router as session_router
from app.routes.speech_endpoints import router as speech_router
from app.routes.job_endpoints import router as job_router
from app.routes.review_endpoints import router as review_router

app = FastAPI(title="AI Interview API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# create tables
Base.metadata.create_all(bind=engine)

# REST routes
app.include_router(question_bank_router)
app.include_router(question_router)
app.include_router(session_router)
app.include_router(feedback_router)
app.include_router(response_router)
app.include_router(interviewee_router)
app.include_router(speech_router)
app.include_router(sandbox_router)
app.include_router(job_router)
app.include_router(review_router)

# WebSocket route
app.include_router(interview_ws_router)


@app.get("/")
def root():
    return {"message": "AI Interview API is running"}