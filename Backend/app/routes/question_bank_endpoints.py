from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.schemas.question_bank import QuestionBankCreate, QuestionBankRead
from app.services.questions.question_bank_logic import (
    create_question_bank,
    get_question_bank,
    get_all_question_banks,
    update_question_bank,
    delete_question_bank,
)

router = APIRouter(prefix="/question-banks", tags=["Question Banks"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=QuestionBankRead, status_code=201)
def create_bank(data: QuestionBankCreate, db: Session = Depends(get_db)):
    return create_question_bank(db, data)


@router.get("/", response_model=list[QuestionBankRead])
def list_banks(db: Session = Depends(get_db)):
    return get_all_question_banks(db)


@router.get("/{bank_id}", response_model=QuestionBankRead)
def read_bank(bank_id: int, db: Session = Depends(get_db)):
    bank = get_question_bank(db, bank_id)
    if not bank:
        raise HTTPException(status_code=404, detail="Question bank not found")
    return bank


@router.put("/{bank_id}", response_model=QuestionBankRead)
def update_bank(bank_id: int, data: QuestionBankCreate, db: Session = Depends(get_db)):
    bank = update_question_bank(db, bank_id, data)
    if not bank:
        raise HTTPException(status_code=404, detail="Question bank not found")
    return bank


@router.delete("/{bank_id}", status_code=204)
def delete_bank(bank_id: int, db: Session = Depends(get_db)):
    deleted = delete_question_bank(db, bank_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Question bank not found")
