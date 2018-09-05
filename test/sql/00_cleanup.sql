drop schema if exists forum_example cascade;
drop schema if exists forum_example_private cascade;
drop role if exists forum_example_person, forum_example_anonymous, forum_example_postgraphile;

\ir ./01_schema.sql
\ir ./02_data.sql

