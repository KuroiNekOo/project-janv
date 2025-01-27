-- Verify mc-auth:02_crud_functions on pg

BEGIN;

-- XXX Add verifications here.

SELECT *
FROM insert_user (
        '{"last_name": "lastname", "first_name": "firstname, "email": "email", "salt": "salt", "is_active": "true"}'::json
    )
WHERE
    false;


-- UPDATE_USER
SELECT *
FROM update_user (
        '{"last_name": "lastname", "first_name": "firstname, "email": "email", "salt": "salt", "is_active": "true"}'::json
    )
WHERE
    false;

ROLLBACK;
