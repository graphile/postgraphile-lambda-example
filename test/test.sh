set -e

echo "Making template.yml"
./make-template-yml.sh
unset DATABASE_URL

echo "Spinning up SAM... (waiting a few seconds)"
trap 'kill $(jobs -p)' EXIT
trap 'kill $(jobs -p)' SIGINT
sam local start-api &
SAM=$!
sleep 5

echo "Attempting a warm-up request..."
curl -i -XPOST \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -d @query.graphql \
  http://127.0.0.1:3000/graphql

echo "Running a few more requests"

for I in `seq 1 10`; do
  time curl -i -XPOST \
    -H 'Accept: application/json' \
    -H 'Content-Type: application/json' \
    -d @query.graphql \
    http://127.0.0.1:3000/graphql
done

echo "Shutting SAM back down..."
kill $SAM
trap - EXIT
trap - SIGINT
wait
echo "Done"
