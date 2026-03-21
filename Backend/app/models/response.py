from datetime import datetime
from sqlalchemy import ForeignKey, Text, Integer, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base

#Response parameters created here, reference feedback.py for more info
class Response(Base):
    __tablename__ = "responses"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    type_of_response: Mapped[str] = mapped_column(String(30), nullable=False)  

    question_id: Mapped[int | None] = mapped_column(
        ForeignKey("questions.id", ondelete="SET NULL"),
        nullable=True,
    )

    feedback_id: Mapped[int | None] = mapped_column(
        ForeignKey("feedback.id", ondelete="SET NULL"),
        nullable=True,
    )

    interview_session_id: Mapped[int] = mapped_column(
        ForeignKey("interview_sessions.id", ondelete="CASCADE"),
        nullable=False,
    )

    response_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    audio_response: Mapped[str | None] = mapped_column(Text, nullable=True)
    response_order: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    question: Mapped["Question | None"] = relationship(
        "Question",
        back_populates="responses",
    )

    interview_session: Mapped["InterviewSession"] = relationship(
        "InterviewSession",
        back_populates="responses",
    )

    linked_feedback: Mapped["Feedback | None"] = relationship(
        "Feedback",
        foreign_keys=[feedback_id],
    )

    feedback_items: Mapped[list["Feedback"]] = relationship(
        "Feedback",
        back_populates="response",
        foreign_keys="Feedback.response_id",
    )