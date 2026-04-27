from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    aws_region: str = "us-east-1"
    aws_s3_bucket: str = "notesharing-notes-209979098025"
    dynamodb_users_table: str = "notesharing-users"
    dynamodb_notes_table: str = "notesharing-notes"
    jwt_secret_key: str = "notesharing-super-secret-jwt-key-2024"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 10080
    groq_api_key: str = ""
    frontend_url: str = "http://localhost:5662"

    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
