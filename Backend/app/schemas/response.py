from datetime import datetime
from pydantic import BaseModel


class ResponseBase(BaseModel):
    type_of_response: str
    question_id: int | None = None
    feedback_id: int | None = None
    interview_session_id: int
    response_text: str | None = None
    audio_response: str | None = None
    response_order: int


class ResponseCreate(ResponseBase):
    pass


class ResponseRead(ResponseBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}