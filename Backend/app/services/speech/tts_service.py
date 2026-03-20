"""Text-to-Speech service using Piper TTS."""

import subprocess
import tempfile
import uuid
import re
from pathlib import Path

from app.config import settings

AUDIO_DIR = Path(tempfile.gettempdir()) / "interview_tts"
AUDIO_DIR.mkdir(exist_ok=True)


def _clean_text_for_speech(text: str) -> str:
    """Strip symbols and numbers so the voice only speaks natural words."""
    # Remove code blocks entirely
    text = re.sub(r'```[\s\S]*?```', '', text)
    # Remove inline code
    text = re.sub(r'`[^`]*`', '', text)
    # Remove URLs
    text = re.sub(r'https?://\S+', '', text)
    # Remove standalone numbers (but keep numbers attached to words like "2nd")
    text = re.sub(r'\b\d+\.?\d*\b', '', text)
    # Remove special symbols but keep basic punctuation (.,!?;:'-) and letters
    text = re.sub(r'[^a-zA-Z\s.,!?;:\'\-]', ' ', text)
    # Collapse multiple spaces/newlines
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def synthesize_speech(text: str) -> str:
    """Convert text to speech using Piper and return the path to the WAV file.

    Args:
        text: The text to convert to speech.

    Returns:
        Path to the generated WAV file (in temp directory).
    """
    cleaned = _clean_text_for_speech(text)
    if not cleaned:
        cleaned = "No speakable content."

    filename = f"{uuid.uuid4().hex}.wav"
    output_path = AUDIO_DIR / filename

    cmd = [
        "piper",
        "--model", settings.PIPER_VOICE_PATH,
        "--output_file", str(output_path),
        "--length_scale", "0.85",
    ]

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
    """Remove a TTS audio file after it has been served."""
    try:
        p = Path(path)
        if p.exists() and p.is_relative_to(AUDIO_DIR):
            p.unlink()
    except OSError:
        pass
