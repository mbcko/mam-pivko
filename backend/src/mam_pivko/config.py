from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="MAM_", env_file=".env", extra="ignore")

    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db: str = "mam_pivko"
    cors_origins: str = "http://localhost:5173"

    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]


settings = Settings()
