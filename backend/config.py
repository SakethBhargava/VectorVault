from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GOOGLE_API_KEY: str
    MAX_FILE_SIZE: int = 10_000_000  # 10MB
    
    class Config:
        env_file = ".env"

settings = Settings()
