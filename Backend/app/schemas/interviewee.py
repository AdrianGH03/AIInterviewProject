from datetime import datetime
from pydantic import BaseModel


class IntervieweeBase(BaseModel):
    name: str


class IntervieweeCreate(IntervieweeBase):
    pass


class IntervieweeRead(IntervieweeBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}