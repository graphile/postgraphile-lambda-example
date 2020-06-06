#!/bin/bash
cd "$(dirname "$0")"

set -e

echo "Attempting a warm-up request..."
curl -i -XPOST \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -d @query.graphql \
  http://127.0.0.1:3000/dev/graphql

echo "Running a few more requests"

for I in `seq 1 10`; do
  time curl -i -XPOST \
    -H 'Accept: application/json' \
    -H 'Content-Type: application/json' \
    -d @query.graphql \
    http://127.0.0.1:3000/dev/graphql
done

echo "Done"
