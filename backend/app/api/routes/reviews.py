from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_db, get_current_user
from app.schemas.review import ReviewCreate, ReviewUpdate
from app.services.review_service import (
    create_review,
    get_review_by_id,
    get_reviews_by_dish_id,
    get_all_reviews,
    update_review,
    delete_review,
)

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.get("/")
async def read_all_reviews(pool=Depends(get_db)):
    return await get_all_reviews(pool)


@router.get("/dish/{dish_id}")
async def read_reviews_by_dish(
    dish_id: int,
    pool=Depends(get_db),
):
    return await get_reviews_by_dish_id(pool, dish_id)


@router.get("/{review_id}")
async def read_review(
    review_id: int,
    pool=Depends(get_db),
):
    review = await get_review_by_id(pool, review_id)

    if review is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )

    return review


@router.post("/", status_code=status.HTTP_201_CREATED)
async def add_review(
    data: ReviewCreate,
    pool=Depends(get_db),
    current_user=Depends(get_current_user),
):
    review = await create_review(
        pool=pool,
        dish_id=data.dish_id,
        user_id=current_user["user_id"],
        rating=data.rating,
        comment=data.comment,
    )

    return review


@router.put("/{review_id}")
async def edit_review(
    review_id: int,
    data: ReviewUpdate,
    pool=Depends(get_db),
    current_user=Depends(get_current_user),
):
    changes = data.model_dump(exclude_unset=True)

    if not changes:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Provide rating or comment to update",
        )

    review = await update_review(
        pool=pool,
        review_id=review_id,
        user_id=current_user["user_id"],
        rating=data.rating,
        comment=data.comment,
    )

    if review is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found or you do not own this review",
        )

    return review


@router.delete("/{review_id}")
async def remove_review(
    review_id: int,
    pool=Depends(get_db),
    current_user=Depends(get_current_user),
):
    deleted = await delete_review(
        pool=pool,
        review_id=review_id,
        user_id=current_user["user_id"],
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found or you do not own this review",
        )

    return {"message": "Review deleted successfully"}