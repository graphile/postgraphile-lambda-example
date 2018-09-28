## Overview

This project shows how to use PostGraphile on Lambda. It's a work in progress
with the following aims:

- [x] Startup without needing to introspect database
- [x] Fast startup
- [x] Small bundle size
- [x] JWT auth supported OOTB
- [x] Graphile-build schema plugin support
- [x] Support for middlewares
- [x] No requirement for Node.js `http`-based libraries (such as Connect,
  Express, Koa)

### Method

Here's some of the techniques we'll be using to achieve the goals:

- webpack - to bundle up the required code into as small a file as possible
  (no need for `node_modules` any more!)
- PostGraphile `writeCache` / `readCache` - we'll introspect the database
  during the build and write the results to a cache file to be included in the
  bundle; then when the Lambda service starts up it can read from the cache
  rather than introspecting the database again.

### Non-goals

We do NOT intend to watch the schema for changes; this means that you *must*
build and release a new version every time you change your database. (You only
need to update the cache file though.)

We do NOT intend to make this fully compatible with the `postgraphile` CLI -
this will be a subset best suited to Lambda usage.

### Phases

The system operates based on a number of phases. Each phase depends on the
previous non-optional phase; so if an earlier phase rebuilds then all later
phases must also rebuild.

#### Phase 1: build postgraphile: `scripts/build`

Uses webpack to produce a single JS file containing all that is necessary,
using `src/index.js` as the entry point.

Compiles `src/**` to `dist/`

**Start here when**: you change your code, add/remove plugins, or upgrade dependencies.

#### Phase 2: generate cache: `scripts/generate-cache`

Uses a similar approach to `postgraphile --write-cache` to write a cache file
containing introspection details of your database.

Generates `dist/postgraphile.cache`

**Start here when**: database schema changes.

#### Phase 3: bundle: `scripts/bundle`

Produce a zip file combining the two artifacts above - `dist/index.js` and `dist/postgraphile.cache`.

Generates `lambda.zip` from `dist/` folder

#### Phase 4 (optional): test: `scripts/test`

Launch the bundle in the `sam local` test environment, and run a series of requests.

**Manual checking of the results is required.**

#### Phase 5: upload to Lambda

Left as an exercise to the reader.

### Prerequisites

* [docker](https://docs.docker.com/install/)
* [aws sam cli](https://docs.aws.amazon.com/lambda/latest/dg/sam-cli-requirements.html) - `pip install aws-sam-cli`

### Running tests

Install dependencies

```
yarn
```

Copy .env.template to .env and customize as you like:

```
cp .env.template .env
```

If you're using the default `.env.template` file then you'll need to populate the
`postgraphile_forum_example` database:

```
./import-example-database
```

Make sure that the query in `test/query.graphql` and the options in `src/postgraphileOptions.js` are both valid for your database.

Run the tests:

```
yarn test
```

Note the first run might take a while whilst the system installs the relevant
docker images.

In the test output you should see a number of `0 error(s)` statements, and some successful GraphQL HTTP request payloads

### Running local sam instance

Do the same as for the test, but instead of running `yarn test` at the end, instead run:

```
yarn sam
```

This will set up a local GraphQL endpoint at http://127.0.0.1:3000/

You can then use a GraphQL client such as Altair or GraphQL Playground to issue requests.

If you're using the sample database then you can generate a JWT via:

```graphql
mutation {
  authenticate(input: {email: "spowell0@noaa.gov", password: "iFbWWlc"}) {
    jwtToken
  }
}
```

([Other users exist](https://github.com/graphile/postgraphile/blob/160670dd91ca7faddf784351b33da2bb9924df39/examples/forum/data.sql#L18-L27).)

Then set the JWT header:

```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiZm9ydW1fZXhhbXBsZV9wZXJzb24iLCJwZXJzb25faWQiOjEsImlhdCI6MTUzODEyOTEyMSwiZXhwIjoxNTM4MjE1NTIxLCJhdWQiOiJwb3N0Z3JhcGhpbGUiLCJpc3MiOiJwb3N0Z3JhcGhpbGUifQ.NFZ10gvIB29VL1p3Wh-Cc74JSigOOhgtqaMCP9ZA2W0"
}
```

Then you can issue an authenticated query:

```graphql
{
  currentPerson {
    nodeId
    id
    fullName
  }
}
```

Note that SAM unpacks the zip and reboots node for every single request, so you're going to suffer some startup latency with this.


### Thanks

Improvements to PostGraphile's support for Lambda were sponsored by https://consciousconsumers.nz/
