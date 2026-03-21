from app.models.question_bank import QuestionBank
from app.models.question import Question
from app.models.interview_session import InterviewSession
from app.models.feedback import Feedback
from app.models.response import Response
from app.models.interviewee import Interviewee
from app.models.review_card import ReviewCard

#this is basically a convenience shortcut where you can import all the tables/models at once
# __all__ is basically the same as * (all) so in main.py app.models imports * (__all__) to know what tables
# to put in the database when creating the tables.
__all__ = [
    "QuestionBank",
    "Question",
    "InterviewSession",
    "Feedback",
    "Response",
    "Interviewee",
    "ReviewCard",
]