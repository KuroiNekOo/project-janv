-- Deploy mc-auth:02_crud_functions to pg

BEGIN;

-- XXX Add DDLs here.

-- USER
-- insert user

CREATE FUNCTION "insert_user"(json) RETURNS "user" AS $$

    INSERT INTO "user" (
        "last_name",
        "first_name",
        "email",
        "salt",
        "is_active"
    ) VALUES (
        $1->>'last_name',
        $1->>'first_name',
        $1->>'email',
        $1->>'salt',
        ($1->>'is_active')::BOOLEAN
    ) RETURNING *

$$ LANGUAGE sql VOLATILE STRICT;

-- update user

CREATE FUNCTION "update_user"(json) RETURNS "user" AS $$

    UPDATE "user" SET
        "last_name" = COALESCE($1->>'last_name', "last_name"),
        "first_name" = COALESCE($1->>'first_name', "first_name"),
        "email" = COALESCE($1->>'email', "email"),
        "password" = COALESCE($1->>'password', "password"),
        "access_token" = COALESCE($1->>'access_token', "access_token"),
        "refresh_token" = COALESCE($1->>'refresh_token', "refresh_token"),
        "salt" = COALESCE($1->>'salt', "salt"),
        "is_active" = COALESCE(($1->>'is_active')::BOOLEAN, "is_active")
    WHERE "id" = ($1->>'id')::INT
    RETURNING *

$$ LANGUAGE sql VOLATILE STRICT;

COMMIT;
