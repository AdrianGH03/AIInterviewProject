from datetime import datetime
from sqlalchemy import String, Integer, ForeignKey, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    question_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # coding | behavioral | system_design
    difficulty: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # easy | medium | hard
    topic: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    time_limit: Mapped[int | None] = mapped_column(Integer, nullable=True)
    questionbank_id: Mapped[int | None] = mapped_column(
        ForeignKey("question_banks.id", ondelete="SET NULL"),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    question_bank: Mapped["QuestionBank | None"] = relationship(
        "QuestionBank",
        back_populates="questions",
    )

    responses: Mapped[list["Response"]] = relationship(
        "Response",
        back_populates="question",
    )

    feedback_items: Mapped[list["Feedback"]] = relationship(
        "Feedback",
        back_populates="question",
    )