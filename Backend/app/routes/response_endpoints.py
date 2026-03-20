from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.schemas.response import ResponseCreate, ResponseRead
from app.services.responses.response_logic import (
    create_response,
    delete_response,
    get_response,
    get_responses_by_session,
)

router = APIRouter(prefix="/responses", tags=["Responses"])


@router.post("/", response_model=ResponseRead, status_code=201)
def create(data: ResponseCreate, db: Session = Depends(get_db)):
    return create_response(db, data)


@router.get("/session/{session_id}", response_model=list[ResponseRead])
def list_by_session(session_id: int, db: Session = Depends(get_db)):
    return get_responses_by_session(db, session_id)


@router.get("/{response_id}", response_model=ResponseRead)
def read(response_id: int, db: Session = Depends(get_db)):
    response = get_response(db, response_id)
    if not response:
        raise HTTPException(status_code=404, detail="Response not found")
    return response


@router.delete("/{response_id}", status_code=204)
def remove(response_id: int, db: Session = Depends(get_db)):
    deleted = delete_response(db, response_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Response not found")
