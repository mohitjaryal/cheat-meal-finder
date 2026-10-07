"""
PostgreSQL schema for the street-food dish review platform, plus a small
migration runner and FastAPI lifespan integration.

Tables vendors, categories, dishes, users, user_reviews, moderation_log

"""

import asyncio
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv

load_dotenv()

import asyncpg
from fastapi import FastAPI, Request

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/streetfood"
)

# 1. ENUM TYPES

SQL_ENUMS = """
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vendor_type_enum') THEN
        CREATE TYPE vendor_type_enum AS ENUM
            ('street_stall', 'food_truck', 'market_stall', 'restaurant');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
        CREATE TYPE user_role_enum AS ENUM ('customer', 'admin');
    END IF;
END
$$;
"""

# 2. TABLES
# Design notes:
#   * IDENTITY columns replace SERIAL (the modern, SQL-standard approach).
#     Switch to BIGINT if you expect billions of rows, e.g. reviews.
#   * TIMESTAMPTZ is used everywhere so time zones are never ambiguous.
#   * MySQL-style `tinyint` in the ERD maps to SMALLINT (with CHECK
#     constraints) or BOOLEAN in PostgreSQL.
#   * Money is NUMERIC(10, 2), never FLOAT.
SQL_TABLES = """
VENDORS: the stalls / restaurants that sell dishes
CREATE TABLE IF NOT EXISTS vendors (
    vendor_id      INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name           VARCHAR(150)      NOT NULL,
    location       VARCHAR(255)      NOT NULL,
    opening_hours  VARCHAR(255),
    vendor_type    vendor_type_enum  NOT NULL DEFAULT 'street_stall'
);

-- CATEGORIES: dish classification (e.g. Snacks, Curries, Desserts)

CREATE TABLE IF NOT EXISTS categories (
    category_id  INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    CONSTRAINT uq_categories_name UNIQUE (name)
);

-- USERS: customers and admins (role decides who can moderate)
-- Email uniqueness (ERD: UK) is enforced case-insensitively by the
-- uq_users_email_lower index in the INDEXES section.
CREATE TABLE IF NOT EXISTS users (
    user_id        INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name      VARCHAR(150)    NOT NULL,
    email          VARCHAR(255)    NOT NULL,
    password_hash  VARCHAR(255)    NOT NULL,  -- store a bcrypt/argon2 hash only
    role           user_role_enum  NOT NULL DEFAULT 'customer',
    created_at     TIMESTAMPTZ     NOT NULL DEFAULT now()
);

DISHES: each dish belongs to one vendor and one category
CREATE TABLE IF NOT EXISTS dishes (
    dish_id      INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    vendor_id    INTEGER        NOT NULL,
    category_id  INTEGER        NOT NULL,
    name         VARCHAR(150)   NOT NULL,
    price        NUMERIC(10, 2) NOT NULL,
    spice_level  SMALLINT       NOT NULL DEFAULT 0,
    description  TEXT,
    image_url    TEXT,

    CONSTRAINT fk_dishes_vendor
        FOREIGN KEY (vendor_id) REFERENCES vendors (vendor_id)
        ON DELETE CASCADE,       -- removing a vendor removes its menu
    CONSTRAINT fk_dishes_category
        FOREIGN KEY (category_id) REFERENCES categories (category_id)
        ON DELETE RESTRICT,      -- don't silently orphan dishes

    CONSTRAINT ck_dishes_price_non_negative CHECK (price >= 0),
    CONSTRAINT ck_dishes_spice_level        CHECK (spice_level BETWEEN 0 AND 5),
    -- Prevents duplicate dish names within the same vendor
    CONSTRAINT uq_dishes_vendor_name UNIQUE (vendor_id, name)
);

USER_REVIEWS: a user's rating and comment on a dish
CREATE TABLE IF NOT EXISTS user_reviews (
    review_id   INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    dish_id     INTEGER     NOT NULL,
    user_id     INTEGER     NOT NULL,
    rating      SMALLINT    NOT NULL,
    comment     TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_flagged  BOOLEAN     NOT NULL DEFAULT FALSE,   -- ERD's tinyint flag

    CONSTRAINT fk_reviews_dish
        FOREIGN KEY (dish_id) REFERENCES dishes (dish_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_reviews_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE CASCADE,

    CONSTRAINT ck_reviews_rating CHECK (rating BETWEEN 1 AND 5),
    -- One review per user per dish. This is not in the ERD, but it's a
    -- common business rule. Delete this line if multiple reviews are OK.
    CONSTRAINT uq_reviews_user_dish UNIQUE (user_id, dish_id)
);

MODERATION_LOG: audit trail of admin actions on reviews
CREATE TABLE IF NOT EXISTS moderation_log (
    log_id      INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    admin_id    INTEGER      NOT NULL,
    review_id   INTEGER      NOT NULL,
    reason      VARCHAR(500) NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),

    -- RESTRICT keeps the audit trail intact: an admin account or a
    -- moderated review can't be deleted while log entries reference it.
    CONSTRAINT fk_modlog_admin
        FOREIGN KEY (admin_id) REFERENCES users (user_id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_modlog_review
        FOREIGN KEY (review_id) REFERENCES user_reviews (review_id)
        ON DELETE RESTRICT
);
"""

# 3. PATCHES FOR EXISTING DATABASES
# CREATE TABLE IF NOT EXISTS does not modify tables that already exist, so
# changes made after the first run go here. Every statement is idempotent.
SQL_PATCHES = """
ALTER TABLE dishes ADD COLUMN IF NOT EXISTS image_url TEXT;
"""

# 4. INDEXES
# PostgreSQL does NOT auto-index foreign key columns, so we add them for
# fast joins and cascading deletes. Composite and partial indexes match the
# most likely query patterns.
SQL_INDEXES = """
-- Browse a vendor's menu / filter dishes by category
CREATE INDEX IF NOT EXISTS idx_dishes_vendor_id   ON dishes (vendor_id);
CREATE INDEX IF NOT EXISTS idx_dishes_category_id ON dishes (category_id);

-- Filter dishes by spice level within a category (common UI filter)
CREATE INDEX IF NOT EXISTS idx_dishes_category_spice ON dishes (category_id, spice_level);

-- Case-insensitive unique email (satisfies the ERD's UK on email).
-- Also serves login lookups: WHERE lower(email) = lower($1)
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email_lower ON users (lower(email));

-- Latest reviews for a dish (paginated review list)
CREATE INDEX IF NOT EXISTS idx_reviews_dish_created
    ON user_reviews (dish_id, created_at DESC);

-- "My reviews" page, ordered by date
CREATE INDEX IF NOT EXISTS idx_reviews_user_created
    ON user_reviews (user_id, created_at DESC);

-- Partial index: flagged reviews are rare, so the admin queue stays tiny/fast
CREATE INDEX IF NOT EXISTS idx_reviews_flagged
    ON user_reviews (created_at DESC) WHERE is_flagged;

-- Moderation history lookups
CREATE INDEX IF NOT EXISTS idx_modlog_review_id ON moderation_log (review_id);
CREATE INDEX IF NOT EXISTS idx_modlog_admin_created
    ON moderation_log (admin_id, created_at DESC);

-- Vendor search by type
CREATE INDEX IF NOT EXISTS idx_vendors_type ON vendors (vendor_type);
"""

# 5. BUSINESS-RULE TRIGGER
# The ERD labels the users -> moderation_log relationship "performs (admin)".
# A plain FK can't check the user's role, so a trigger enforces that only
# admins can appear as admin_id.
SQL_TRIGGERS = """
CREATE OR REPLACE FUNCTION enforce_admin_moderator()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM users
        WHERE user_id = NEW.admin_id AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'User % is not an admin and cannot moderate reviews',
            NEW.admin_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_modlog_admin_only ON moderation_log;
CREATE TRIGGER trg_modlog_admin_only
    BEFORE INSERT OR UPDATE OF admin_id ON moderation_log
    FOR EACH ROW EXECUTE FUNCTION enforce_admin_moderator();
"""

# 6. TABLE / COLUMN COMMENTS (shows up in psql \d+ and tools like DBeaver)
SQL_COMMENTS = """
COMMENT ON TABLE  vendors        IS 'Food vendors (stalls, trucks, restaurants).';
COMMENT ON TABLE  categories     IS 'Dish classifications.';
COMMENT ON TABLE  dishes         IS 'Menu items offered by vendors.';
COMMENT ON TABLE  users          IS 'Registered users; role controls moderation rights.';
COMMENT ON TABLE  user_reviews   IS 'Ratings and comments left by users on dishes.';
COMMENT ON TABLE  moderation_log IS 'Audit log of admin actions on reviews.';
COMMENT ON COLUMN dishes.spice_level  IS '0 = not spicy, 5 = extremely spicy.';
COMMENT ON COLUMN dishes.image_url    IS 'URL of the dish photo.';
COMMENT ON COLUMN user_reviews.rating IS 'Star rating from 1 to 5.';
"""

# Order matters: types -> tables -> patches -> indexes -> triggers -> comments.
MIGRATION_STEPS = [
    ("enums", SQL_ENUMS),
    ("tables", SQL_TABLES),
    ("patches", SQL_PATCHES),
    ("indexes", SQL_INDEXES),
    ("triggers", SQL_TRIGGERS),
    ("comments", SQL_COMMENTS),
]

# 7. MIGRATION RUNNER
async def apply_schema(pool: asyncpg.Pool) -> None:
    """Apply the schema atomically: everything succeeds or nothing does."""
    async with pool.acquire() as conn:
        async with conn.transaction():
            for label, sql in MIGRATION_STEPS:
                await conn.execute(sql)
                print(f"[schema] applied: {label}")


# 8. FASTAPI INTEGRATION
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create one shared connection pool per process, and close it on exit."""
    app.state.pool = await asyncpg.create_pool(
        DATABASE_URL, min_size=2, max_size=10
    )
    await apply_schema(app.state.pool)  # fine for dev; use Alembic in prod
    yield
    await app.state.pool.close()


app = FastAPI(title="Street Food Reviews API", lifespan=lifespan)


async def get_pool(request: Request) -> asyncpg.Pool:
    """Dependency: `pool: asyncpg.Pool = Depends(get_pool)` in route handlers."""
    return request.app.state.pool


@app.get("/health")
async def health(request: Request):
    async with request.app.state.pool.acquire() as conn:
        await conn.fetchval("SELECT 1")
    return {"status": "ok"}


if __name__ == "__main__":

    async def _main():
        pool = await asyncpg.create_pool(DATABASE_URL)
        await apply_schema(pool)
        await pool.close()

    asyncio.run(_main()) 