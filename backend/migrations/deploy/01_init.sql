-- Deploy skillforge:01_init to pg

BEGIN;

-- https://regexr.com/3e48o
CREATE DOMAIN "user_email_domain" AS TEXT
CHECK (
    VALUE ~
    '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$'
);

CREATE TABLE "user" (
    "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "email" user_email_domain UNIQUE NOT NULL,
    "last_name" TEXT,
    "first_name" TEXT,
    "password" TEXT,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "salt" TEXT NOT NULL,
    "is_active" BOOLEAN DEFAULT TRUE,
    "last_login" TIMESTAMPTZ DEFAULT now(),
    "created_at" TIMESTAMPTZ DEFAULT now(),
    "updated_at" TIMESTAMPTZ
);

CREATE TABLE "role" (
    "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "name" TEXT UNIQUE NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN DEFAULT TRUE,
    "created_at" TIMESTAMPTZ DEFAULT now(),
    "updated_at" TIMESTAMPTZ
);

CREATE TABLE "permission" (
    "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "name" TEXT UNIQUE NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN DEFAULT TRUE,
    "created_at" TIMESTAMPTZ DEFAULT now(),
    "updated_at" TIMESTAMPTZ
);

CREATE TABLE "user_has_role" (
    "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "user_id" INT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "role_id" INT NOT NULL REFERENCES "role"("id") ON DELETE CASCADE,
    "is_active" BOOLEAN DEFAULT TRUE,
    "created_at" TIMESTAMPTZ DEFAULT now(),
    "updated_at" TIMESTAMPTZ
);

CREATE TABLE "role_has_permission" (
    "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "role_id" INT NOT NULL REFERENCES "role"("id") ON DELETE CASCADE,
    "permission_id" INT NOT NULL REFERENCES "permission"("id") ON DELETE CASCADE,
    "is_active" BOOLEAN DEFAULT TRUE,
    "created_at" TIMESTAMPTZ DEFAULT now(),
    "updated_at" TIMESTAMPTZ
);

-- Add constraints (composite key) TABLE user_has_role
ALTER TABLE "user_has_role"
ADD CONSTRAINT unique_user_role UNIQUE ("user_id", "role_id");

-- Add constraints (composite key) TABLE role_has_permission
ALTER TABLE "role_has_permission"
ADD CONSTRAINT unique_role_permission UNIQUE ("role_id", "permission_id");

-- seeding

INSERT INTO "user" ("email", "last_name", "first_name", "salt") VALUES ('test@keyce.fr', 'molo', 'bob', 'saaaaalt');
INSERT INTO "role" ("name") VALUES ('user'), ('admin');
INSERT INTO "permission" ("name") VALUES ('signin'), ('signup'), ('delete_user'), ('create_user');
INSERT INTO "user_has_role" ("user_id", "role_id") VALUES (1, 1), (1, 2);
INSERT INTO "role_has_permission" ("role_id", "permission_id") VALUES (1, 1), (1, 2), (2, 3), (2, 4);

COMMIT;