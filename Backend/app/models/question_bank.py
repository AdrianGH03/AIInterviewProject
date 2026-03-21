from datetime import datetime
from sqlalchemy import String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base

#Question bank parameters created here, reference feedback.py for more info
class QuestionBank(Base):
    __tablename__ = "question_banks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    topic: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    questions: Mapped[list["Question"]] = relationship(
        "Question",
        back_populates="question_bank",
        cascade="all, delete-orphan",
    )

    interview_sessions: Mapped[list["InterviewSession"]] = relationship(
        "InterviewSession",
        back_populates="question_bank",
    )