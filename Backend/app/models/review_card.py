from datetime import datetime
from sqlalchemy import Integer, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base

#Review Card parameters created here, reference feedback.py for more info
class ReviewCard(Base):
    __tablename__ = "review_cards"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    question_id: Mapped[int] = mapped_column(
        ForeignKey("questions.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    ease_factor: Mapped[float] = mapped_column(Float, default=2.5, nullable=False)
    interval_days: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    repetitions: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    next_review_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    last_reviewed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    question: Mapped["Question"] = relationship("Question")
