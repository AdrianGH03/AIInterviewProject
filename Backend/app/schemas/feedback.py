from datetime import datetime
from pydantic import BaseModel

#Creates base schema for Feedback model
class FeedbackBase(BaseModel):
    feedback_text: str
    interview_session_id: int
    question_id: int | None = None
    response_id: int | None = None
    audio_feedback: str | None = None

#Client calls this, and pass basically says use the base parameters above ^^ and that's it, passing it.
class FeedbackCreate(FeedbackBase):
    pass

#Used for creating and returning the feedback response in HTTP, when called, adds id and created_at on top of the base schema above ^^
class FeedbackRead(FeedbackBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}