import uuid
from pathlib import Path

import whisper

_model = "large-v3"

#Create a temporary directory to store speech to text audio files
UPLOAD_DIR = Path("audio_uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


def _get_model():
    global _model
    if _model is None:
        _model = whisper.load_model("small")
    return _model


def transcribe_audio(audio_bytes: bytes, original_filename: str = "audio.webm") -> str:
    #create unique filepath for uploaded audio
    suffix = Path(original_filename).suffix or ".webm"
    temp_path = UPLOAD_DIR / f"{uuid.uuid4().hex}{suffix}"

    try:
        temp_path.write_bytes(audio_bytes)    #save the raw audio to the temp file
        model = _get_model()                  #get (or load) the Whisper model
        result = model.transcribe(
            str(temp_path),                   #path to the audio file
            fp16=False,                       #don't use half-precision floats (safer on CPUs without GPU)
            language="en",                    #assume English — skips language detection, faster
            condition_on_previous_text=False, #don't let earlier transcription influence later parts
                                                #(prevents hallucination/repetition loops)
            no_speech_threshold=0.6,          #if Whisper is >60% confident a segment is silence,
                                                #skip it instead of hallucinating words
        )
        return result["text"].strip()         #return just the text, trimmed of whitespace
    finally:
        temp_path.unlink(missing_ok=True)
