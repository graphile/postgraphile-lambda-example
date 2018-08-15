## Overview

There are two stages:
    1) generate cache & lambda.zip
    2) launch lambda.zip in sam local container

Stage 1 needs to be repeated any time the schema or source code changes.
Stage 2 can be executed as often as desired for testing.

## Prerequisites

* [docker](https://docs.docker.com/install/)
* [docker-compose](https://docs.docker.com/compose/install/)
* [aws sam cli](https://docs.aws.amazon.com/lambda/latest/dg/sam-cli-requirements.html)

### Stage 1
To create the schema cache and zip the code into a lambda compatible archive run:

### Stage 2
Start the database

    docker-compose up -d
    sam local start-api

Open a new terminal and wait for a **few minutes** after executing:

    curl -i -H 'Accept: application/json' -H 'Content-Type: application/json' -XPOST -d '{ "query": "mutation { authenticate (input: { clientMutationId: \"cmId\", email: \"test@test.test\", password: \"123\" }) { jwtToken { role } } }" }' http://localhost:3000/graphql

## Thanks

The SQL files are from the [forum example](https://github.com/graphile/postgraphile/tree/master/examples/forum)

A utility script from [vishnubob/wait-for-it](https://github.com/vishnubob/wait-for-it)
 https://raw.githubusercontent.com//master/wait-for-it.sh prevents the makeCache script from running before postgres has fully started up.
