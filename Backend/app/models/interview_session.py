from datetime import datetime
from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # technical | behavioral
    topic: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    difficulty: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # easy | medium | hard
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    time_started: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    time_ended: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    question_bank_id: Mapped[int | None] = mapped_column(
        ForeignKey("question_banks.id", ondelete="SET NULL"),
        nullable=True,
    )
    timer_duration: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    question_bank: Mapped["QuestionBank | None"] = relationship(
        "QuestionBank",
        back_populates="interview_sessions",
    )

    responses: Mapped[list["Response"]] = relationship(
        "Response",
        back_populates="interview_session",
        cascade="all, delete-orphan",
        order_by="Response.response_order",
    )

    feedback_items: Mapped[list["Feedback"]] = relationship(
        "Feedback",
        back_populates="interview_session",
        cascade="all, delete-orphan",
    )