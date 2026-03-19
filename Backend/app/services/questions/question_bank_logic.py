#question bank gets created by calling a POST request with the parameters of id, topic, name, description, created_at, a dynamic (initially empty) list
#of questions, and a dynamic (initially empty) list of interview sessions tied to the question bank through it's id.

#question bank can be created, read from, updated, and deleted by calling the appropriate HTTP request with the question bank's id as a parameter.
from sqlalchemy.orm import Session
from app.models import QuestionBank
from app.schemas.question_bank import QuestionBankCreate


def create_question_bank(db: Session, data: QuestionBankCreate) -> QuestionBank:
    bank = QuestionBank(
        topic=data.topic,
        name=data.name,
        description=data.description,
    )
    db.add(bank)
    db.commit()
    db.refresh(bank)
    return bank


def get_question_bank(db: Session, bank_id: int) -> QuestionBank | None:
    return db.query(QuestionBank).filter(QuestionBank.id == bank_id).first()


def get_all_question_banks(db: Session) -> list[QuestionBank]:
    return db.query(QuestionBank).all()


def update_question_bank(db: Session, bank_id: int, data: QuestionBankCreate) -> QuestionBank | None:
    bank = get_question_bank(db, bank_id)
    if not bank:
        return None
    bank.topic = data.topic
    bank.name = data.name
    bank.description = data.description
    db.commit()
    db.refresh(bank)
    return bank


def delete_question_bank(db: Session, bank_id: int) -> bool:
    bank = get_question_bank(db, bank_id)
    if not bank:
        return False
    db.delete(bank)
    db.commit()
    return True
