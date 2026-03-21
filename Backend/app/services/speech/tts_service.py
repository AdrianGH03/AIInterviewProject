import subprocess
import tempfile
import uuid
import re
from pathlib import Path

from app.config import settings

#Stores audio in a temp directory and creates it if it doesn't exist. This is where the generated WAV files will be saved before being served to the frontend.
AUDIO_DIR = Path(tempfile.gettempdir()) / "interview_tts"
AUDIO_DIR.mkdir(exist_ok=True)

#Cleans text so the AI audio is not saying every single code snippet, link, or number. It also removes special characters that might cause issues with the TTS engine.
def _clean_text_for_speech(text: str) -> str:
    text = re.sub(r'```[\s\S]*?```', '', text)
    text = re.sub(r'`[^`]*`', '', text)
    text = re.sub(r'https?://\S+', '', text)
    text = re.sub(r'\b\d+\.?\d*\b', '', text)
    text = re.sub(r'[^a-zA-Z\s.,!?;:\'\-]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def synthesize_speech(text: str) -> str:
    cleaned = _clean_text_for_speech(text)
    if not cleaned:
        cleaned = "No speakable content."

    filename = f"{uuid.uuid4().hex}.wav"
    output_path = AUDIO_DIR / filename

    #length_scale is the speed, the closer to 0 the faster
    cmd = [
        "piper",
        "--model", settings.PIPER_VOICE_PATH,
        "--output_file", str(output_path),
        "--length_scale", "0.74",
    ]

    #Run in terminal and capture output, if it fails raise an error with the stderr output from the command.
    proc = subprocess.run(
        cmd,
        input=cleaned,
        capture_output=True,
        text=True,
        timeout=30,
    )

    if proc.returncode != 0:
        raise RuntimeError(f"Piper TTS failed: {proc.stderr}")

    return str(output_path)


def cleanup_audio_file(path: str) -> None:
    try:
        p = Path(path)
        #is_relative_to checks if file is still in the directory we created for audio files, this is a safety check to prevent deleting random files on the system. If the file exists and is in the correct directory, it will be deleted.
        if p.exists() and p.is_relative_to(AUDIO_DIR):
            p.unlink()
    except OSError:
        pass
