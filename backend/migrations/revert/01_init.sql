-- Revert skillforge:01_init from pg

BEGIN;

-- XXX Add DDLs here.
DROP TABLE IF EXISTS 
    "user",
    "role", 
    "permission", 
    "user_has_role", 
    "role_has_permission"
CASCADE;

DROP DOMAIN IF EXISTS 
    "user_email_domain"
CASCADE;

COMMIT;