from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="MAM_", env_file=".env")

    mongodb_uri: str
    mongodb_db: str = "mam_pivko"
    cors_origins: list[str] = ["http://localhost:5173"]
    env: str = "development"


settings = Settings()  # type: ignore[call-arg]
