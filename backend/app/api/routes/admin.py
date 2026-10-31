from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_db, get_current_admin
from app.services.admin_service import (
    get_all_users,
    get_user_by_id,
    get_flagged_reviews,
    moderate_review,
    get_moderation_logs,
)

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users")
async def read_all_users(
    pool=Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    return await get_all_users(pool)


@router.get("/users/{user_id}")
async def read_user(
    user_id: int,
    pool=Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    user = await get_user_by_id(pool, user_id)

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return user


@router.get("/flagged-reviews")
async def read_flagged_reviews(
    pool=Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    return await get_flagged_reviews(pool)


@router.patch("/reviews/{review_id}/moderate")
async def moderate_review_route(
    review_id: int,
    is_flagged: bool,
    reason: str,
    pool=Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    result = await moderate_review(
        pool,
        current_admin["user_id"],
        review_id,
        is_flagged,
        reason,
    )

    if result is None:
        raise HTTPException(status_code=404, detail="Review not found")

    return result


@router.get("/moderation-logs")
async def read_moderation_logs(
    pool=Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    return await get_moderation_logs(pool)
