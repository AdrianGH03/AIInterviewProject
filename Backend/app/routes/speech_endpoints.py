from fastapi import APIRouter, HTTPException, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel
from starlette.background import BackgroundTask

from app.services.speech.stt_service import transcribe_audio
from app.services.speech.tts_service import synthesize_speech, cleanup_audio_file

router = APIRouter(prefix="/speech", tags=["Speech"])


class TTSRequest(BaseModel):
    text: str


class TranscriptionResponse(BaseModel):
    text: str


@router.post("/tts")
async def text_to_speech(request: TTSRequest):
    """Convert text to speech and return the audio file, then delete it."""
    try:
        audio_path = synthesize_speech(request.text)
        return FileResponse(
            audio_path,
            media_type="audio/wav",
            filename="speech.wav",
            background=BackgroundTask(cleanup_audio_file, audio_path),
        )
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stt", response_model=TranscriptionResponse)
async def speech_to_text(file: UploadFile):
    """Transcribe uploaded audio to text."""
    audio_bytes = await file.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio file")

    text = transcribe_audio(audio_bytes, file.filename or "audio.webm")
    return TranscriptionResponse(text=text)
