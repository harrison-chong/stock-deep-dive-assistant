from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Config(BaseSettings):
    BASE_URL: str = Field(
        default="https://openrouter.ai/api/v1",
        description="Base URL for the AI model API",
    )
    API_KEY: str = Field(default="", description="API key for the AI model")
    MODEL_NAME: str = Field(
        default="x-ai/grok-4-fast:free", description="Name of the AI model to use"
    )

    model_config = SettingsConfigDict(env_file=".env")


config = Config()
