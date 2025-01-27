-- Verify skillforge:01_init on pg

BEGIN;

-- XXX Add verifications here.

SELECT * FROM "user" WHERE false;
SELECT * FROM "role" WHERE false;
SELECT * FROM "permission" WHERE false;
SELECT * FROM "user_has_role" WHERE false;
SELECT * FROM "role_has_permision" WHERE false;

ROLLBACK;