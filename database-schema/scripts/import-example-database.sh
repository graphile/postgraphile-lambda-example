#!/bin/bash

set -e

# Load the schema
#   curl -sL https://github.com/graphile/postgraphile/raw/160670dd91ca7faddf784351b33da2bb9924df39/examples/forum/schema.sql | psql -X forum_example_postgraphile
psql -v ON_ERROR_STOP=1 -d "$POSTGRES_DB" --username "$POSTGRES_USER" forum_example_postgraphile -f /sql-temp/01_schema.sql

# Load the data
#   curl -sL https://github.com/graphile/postgraphile/raw/160670dd91ca7faddf784351b33da2bb9924df39/examples/forum/data.sql | psql -X forum_example_postgraphile
psql -v ON_ERROR_STOP=1 -d "$POSTGRES_DB" --username "$POSTGRES_USER" forum_example_postgraphile -f /sql-temp/02_data.sql

echo
echo
echo
echo 'Local database `forum_example_postgraphile` set up successfully, you can run it through postgraphile with'
echo
echo "  postgraphile -c postgres://forum_example_postgraphile:xyz@localhost/forum_example_postgraphile -s forum_example --jwt-secret '${JWT_SECRET-secret}' --jwt-token-identifier 'forum_example.jwt_token'"
echo
echo
