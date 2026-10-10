# class Settings:
#     DB_HOST = "localhost"
#     DB_PORT = 5432
#     DB_NAME = "cheatmeal"
#     DB_USER = "mohit"
#     DB_PASSWORD = "@#mohitdb"


import os
from urllib.parse import urlparse


class Settings:
    DATABASE_URL = os.getenv("DATABASE_URL")

    if DATABASE_URL:
        _db_url = urlparse(DATABASE_URL)
        DB_HOST = _db_url.hostname or "localhost"
        DB_PORT = _db_url.port or 5432
        DB_NAME = _db_url.path.lstrip("/")
        DB_USER = _db_url.username
        DB_PASSWORD = _db_url.password
    else:
        DB_HOST = "localhost"
        DB_PORT = 5432
        DB_NAME = "cheatmeal"
        DB_USER = "mohit"
        DB_PASSWORD = os.getenv("DB_PASSWORD", "")
