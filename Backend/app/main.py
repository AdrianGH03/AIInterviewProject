from fastapi import FastAPI
from app.db.database import Base, engine

from app.models import *
from app.routes.question_bank_endpoints import router as question_bank_router
from app.routes.question_endpoints import router as question_router

app = FastAPI()

# create tables
Base.metadata.create_all(bind=engine)

app.include_router(question_bank_router)
app.include_router(question_router)


@app.get("/")
def root():
    return {"message": "API is running"}