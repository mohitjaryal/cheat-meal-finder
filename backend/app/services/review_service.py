
async def create_review(
    pool,
    dish_id: int,
    user_id: int,
    rating: int,
    comment: str | None = None,
):
    query = """
        INSERT INTO user_reviews
            (dish_id, user_id, rating, comment)
        VALUES ($1, $2, $3, $4)
        RETURNING
            review_id, dish_id, user_id, rating,
            comment, created_at, is_flagged
    """
    row = await pool.fetchrow(
        query, dish_id, user_id, rating, comment
    )
    return dict(row) if row else None


async def get_review_by_id(pool, review_id: int):
    query = """
        SELECT review_id, dish_id, user_id, rating,
               comment, created_at, is_flagged
        FROM user_reviews
        WHERE review_id = $1
    """
    row = await pool.fetchrow(query, review_id)
    return dict(row) if row else None


async def get_reviews_by_dish_id(pool, dish_id: int):
    query = """
        SELECT review_id, dish_id, user_id, rating,
               comment, created_at, is_flagged
        FROM user_reviews
        WHERE dish_id = $1
        ORDER BY created_at DESC
    """
    rows = await pool.fetch(query, dish_id)
    return [dict(row) for row in rows]


async def get_all_reviews(pool):
    query = """
        SELECT review_id, dish_id, user_id, rating,
               comment, created_at, is_flagged
        FROM user_reviews
        ORDER BY created_at DESC
    """
    rows = await pool.fetch(query)
    return [dict(row) for row in rows]


async def update_review(
    pool,
    review_id: int,
    user_id: int,
    rating: int | None = None,
    comment: str | None = None,
):
    query = """
        UPDATE user_reviews
        SET
            rating = COALESCE($1, rating),
            comment = COALESCE($2, comment)
        WHERE review_id = $3
          AND user_id = $4
        RETURNING
            review_id, dish_id, user_id, rating,
            comment, created_at, is_flagged
    """
    row = await pool.fetchrow(
        query, rating, comment, review_id, user_id
    )
    return dict(row) if row else None


async def delete_review(pool, review_id: int, user_id: int):
    result = await pool.execute(
        """
        DELETE FROM user_reviews
        WHERE review_id = $1 AND user_id = $2
        """,
        review_id,
        user_id,
    )
    return result == "DELETE 1"
