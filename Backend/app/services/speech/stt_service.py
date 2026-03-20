"""Speech-to-Text service using OpenAI Whisper."""

import uuid
from pathlib import Path

import whisper

_model = None

UPLOAD_DIR = Path("audio_uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


def _get_model():
    global _model
    if _model is None:
        _model = whisper.load_model("small")
    return _model


def transcribe_audio(audio_bytes: bytes, original_filename: str = "audio.webm") -> str:
    """Transcribe audio bytes to text using Whisper.

    Args:
        audio_bytes: Raw audio file bytes.
        original_filename: Original filename for extension detection.

    Returns:
        Transcribed text.
    """
    suffix = Path(original_filename).suffix or ".webm"
    temp_path = UPLOAD_DIR / f"{uuid.uuid4().hex}{suffix}"

    try:
        temp_path.write_bytes(audio_bytes)
        model = _get_model()
        result = model.transcribe(
            str(temp_path),
            fp16=False,
            language="en",
            condition_on_previous_text=False,
            no_speech_threshold=0.6,
        )
        return result["text"].strip()
    finally:
        temp_path.unlink(missing_ok=True)
