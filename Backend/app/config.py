from pydantic_settings import BaseSettings, SettingsConfigDict

#This pretty much creates the env variables for the project so FastAPI/Python can understand it with pydantic.
class Settings(BaseSettings):
    DATABASE_URL: str

    POSTGRES_USER: str | None = None
    POSTGRES_PASSWORD: str | None = None
    POSTGRES_DB: str | None = None
    POSTGRES_PORT: int | None = None
    REDIS_HOST: str | None = None
    REDIS_PORT: int | None = None

    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.1:8b"

    PIPER_VOICE_PATH: str = "voices/en_US-norman-medium.onnx"

    FRONTEND_URL: str = "http://localhost:4200"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = Settings()