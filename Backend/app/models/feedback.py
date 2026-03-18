from datetime import datetime
from sqlalchemy import ForeignKey, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base


class Feedback(Base):
    __tablename__ = "feedback"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    feedback_text: Mapped[str] = mapped_column(Text, nullable=False)

    interview_session_id: Mapped[int] = mapped_column(
        ForeignKey("interview_sessions.id", ondelete="CASCADE"),
        nullable=False,
    )

    question_id: Mapped[int | None] = mapped_column(
        ForeignKey("questions.id", ondelete="SET NULL"),
        nullable=True,
    )

    response_id: Mapped[int | None] = mapped_column(
        ForeignKey("responses.id", ondelete="SET NULL"),
        nullable=True,
    )

    audio_feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    interview_session: Mapped["InterviewSession"] = relationship(
        "InterviewSession",
        back_populates="feedback_items",
    )

    question: Mapped["Question | None"] = relationship(
        "Question",
        back_populates="feedback_items",
    )

    response: Mapped["Response | None"] = relationship(
        "Response",
        back_populates="feedback_items",
        foreign_keys=[response_id],
    )