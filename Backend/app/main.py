from fastapi import FastAPI
from app.db.database import Base, engine

from app.models import *

app = FastAPI()

# create tables
#Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"message": "API is running"}