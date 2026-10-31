
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
)


async def register_user(db, name: str, email: str, password: str):
    # Check if user already exists
    existing_user = await db.fetchrow(
        """
        SELECT user_id
        FROM users
        WHERE email = $1
        """,
        email,
    )

    if existing_user:
        return None

    # Hash password before saving
    hashed_password = get_password_hash(password)

    # Insert user using the actual database column: full_name
    user = await db.fetchrow(
        """
        INSERT INTO users (full_name, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING user_id, full_name, email
        """,
        name,
        email,
        hashed_password,
    )

    return dict(user) if user else None


async def login_user(db, email: str, password: str):
    user = await db.fetchrow(
        """
        SELECT user_id, full_name, email, password_hash
        FROM users
        WHERE email = $1
        """,
        email,
    )

    if not user:
        return None

    if not verify_password(password, user["password_hash"]):
        return None

    token = create_access_token(
        {"sub": str(user["user_id"])}
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "user_id": user["user_id"],
            "full_name": user["full_name"],
            "email": user["email"],
        },
    }


async def get_user_by_id(db, user_id: int):
    user = await db.fetchrow(
        """
        SELECT user_id, full_name, email
        FROM users
        WHERE user_id = $1
        """,
        user_id,
    )

    return dict(user) if user else None
