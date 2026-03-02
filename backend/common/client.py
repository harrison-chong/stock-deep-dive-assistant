from openai import OpenAI

from common.config import config

client = OpenAI(
    base_url=config.BASE_URL,
    api_key=config.API_KEY,
)
