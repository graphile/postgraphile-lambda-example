CREATE SCHEMA app_public;
CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;
CREATE TABLE app_public."values" (
    id serial primary key,
    value text NOT NULL
);
ALTER TABLE app_public."values" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA app_public TO lambda_example_user;
GRANT SELECT ON TABLE app_public."values" TO lambda_example_user;
