async def get_all_users(pool):
    query = """
        SELECT user_id, full_name, email, role, created_at
        FROM users
        ORDER BY user_id
    """
    rows = await pool.fetch(query)
    return [dict(row) for row in rows]


async def get_user_by_id(pool, user_id: int):
    query = """
        SELECT user_id, full_name, email, role, created_at
        FROM users
        WHERE user_id = $1
    """
    row = await pool.fetchrow(query, user_id)
    return dict(row) if row else None


async def get_flagged_reviews(pool):
    query = """
        SELECT review_id, dish_id, user_id, rating, comment,
               created_at, is_flagged
        FROM user_reviews
        WHERE is_flagged = TRUE
        ORDER BY created_at DESC
    """
    rows = await pool.fetch(query)
    return [dict(row) for row in rows]

async def moderate_review(pool, admin_id: int, review_id: int, is_flagged: bool, reason: str):
    async with pool.acquire() as conn:
        async with conn.transaction():
            review = await conn.fetchrow(
                "SELECT review_id FROM user_reviews WHERE review_id = $1",
                review_id,
            )

            if review is None:
                return None

            await conn.execute(
                """
                UPDATE user_reviews
                SET is_flagged = $1
                WHERE review_id = $2
                """,
                is_flagged,
                review_id,
            )

            await conn.execute(
                """
                INSERT INTO moderation_log (admin_id, review_id, reason)
                VALUES ($1, $2, $3)
                """,
                admin_id,
                review_id,
                reason,
            )

            return {
                "review_id": review_id,
                "is_flagged": is_flagged,
                "reason": reason,
            }


async def get_moderation_logs(pool):
    query = """
        SELECT log_id, admin_id, review_id, reason, created_at
        FROM moderation_log
        ORDER BY created_at DESC
    """
    rows = await pool.fetch(query)
    return [dict(row) for row in rows]