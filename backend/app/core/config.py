import os
from urllib.parse import urlparse, unquote
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL = os.getenv("DATABASE_URL")

    if DATABASE_URL:
        db_url = urlparse(DATABASE_URL)

        DB_HOST = db_url.hostname
        DB_PORT = db_url.port or 5432
        DB_NAME = db_url.path.lstrip("/")
        DB_USER = unquote(db_url.username or "")
        DB_PASSWORD = unquote(db_url.password or "")
    else:
        DB_HOST = "localhost"
        DB_PORT = 5432
        DB_NAME = "cheatmeal"
        DB_USER = "mohit"
        DB_PASSWORD = os.getenv("DB_PASSWORD", "")

    SECRET_KEY = os.getenv("SECRET_KEY")
    if not SECRET_KEY:
        raise ValueError("SECRET_KEY environment variable is required")

    ALGORITHM = "HS256"


settings = Settings()