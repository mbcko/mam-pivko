from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="MAM_", env_file=".env")

    mongodb_uri: str
    mongodb_db: str = "mam_pivko"
    cors_origins: str = "http://localhost:5173"
    env: str = "development"

    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]


settings = Settings()  # type: ignore[call-arg]
