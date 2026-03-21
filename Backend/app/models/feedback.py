from datetime import datetime
from sqlalchemy import ForeignKey, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base

#Class feedback that imports base(declares the class)
#__tablename__ defines the table name in Postgres for the class

class Feedback(Base):
    __tablename__ = "feedback"

    #Mapped is SQLAlchemy's way of connecting Python types to database columns, so if I want Feedback with a parameter of id, I use mapped to put it on Postgres
    #mapped_column() decides how it should work. For id primary_key = true because its the primary key to call a feedback session
    #index = true means to create a db index, like an array where you can look up the index.
    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    #1st parameter tells how the parameter should be saved as, in this case Text.
    #2nd nullable= means if they value can be null or not. This is useful in determining if a value is empty at first then later on dynamically updated.
    feedback_text: Mapped[str] = mapped_column(Text, nullable=False)

    #ForeignKey means this columns value must match an id in another table, in this case interview session matches the interview session(s) id.
    #ondelete tells the column to do when the foreign key in this case is deleted. CASCADE means to also delete this entry when the foreign key is deleted.
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

    #default parameter means to set a default value when creating this row in the table.
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    #relationship() nativagates between linked objects, back_populates makes sure when you update one object, the other gets updated as well without requiring a call to the db.
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