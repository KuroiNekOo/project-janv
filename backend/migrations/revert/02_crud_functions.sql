-- Revert mc-auth:02_crud_functions from pg

BEGIN;

-- XXX Add DDLs here.

DROP FUNCTION IF EXISTS 
    "insert_user",
    "update_user";

COMMIT;
