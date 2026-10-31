
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field

from app.api.deps import get_db
from app.services.user_service import (
    register_user,
    login_user,
    get_user_by_id,
)
from app.api.deps import get_db, get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


class UserRegister(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    payload: UserRegister,
    db=Depends(get_db),
):
    user = await register_user(
        db,
        payload.name,
        str(payload.email).strip().lower(),
        payload.password,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    return user


@router.post("/login")
async def login(
    payload: UserLogin,
    db=Depends(get_db),
):
    result = await login_user(
        db,
        str(payload.email).strip().lower(),
        payload.password,
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    return result

# Me roote
@router.get("/me")
async def get_me(
    current_user=Depends(get_current_user),
):
    return current_user

@router.get("/{user_id}")
async def get_user(
    user_id: int,
    db=Depends(get_db),
):
    user = await get_user_by_id(db, user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user