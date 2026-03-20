from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.sandbox.code_runner import run_code

router = APIRouter(prefix="/sandbox", tags=["Code Sandbox"])


class RunCodeRequest(BaseModel):
    language: str = Field(default="python", description="Programming language")
    code: str = Field(description="Source code to execute")
    stdin: str = Field(default="", description="Standard input for the program")


class RunCodeResponse(BaseModel):
    stdout: str
    stderr: str
    exit_code: int
    timed_out: bool


@router.post("/run", response_model=RunCodeResponse)
def execute_code(request: RunCodeRequest):
    """Execute code in a sandboxed environment and return the output."""
    result = run_code(
        language=request.language,
        code=request.code,
        stdin_input=request.stdin,
    )
    return RunCodeResponse(**result)
