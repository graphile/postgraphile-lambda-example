## Overview

This project shows how to use PostGraphile on Lambda. It's a work in progress
with the following aims:

- [ ] Startup without needing to introspect database
- [ ] Fast startup
- [ ] Small bundle size
- [ ] JWT auth supported OOTB
- [ ] No features unsuitable for Lambda (subscriptions, watch mode)
- [ ] Graphile-build schema plugin support
- [ ] Potentially support for middlewares
- [ ] No requirement for Node.js `http`-based libraries (such as Connect,
  Express, Koa) - instead use native Lambda event handlers

It may or may not include GraphiQL, that's not been decided yet.

### Method

Here's some of the techniques we'll be using to achieve the goals:

- webpack - to bundle up the required code into as small a file as possible
  (hopefully we can get to the point where uploading `node_modules` is
  unnecessary)
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

Each phase depends on the previous non-optional phase; so if an earlier phase
rebuilds all later phases must also.

#### Phase 1: build postgraphile

Uses webpack to produce a single JS file containing all that is necessary.

Compiles `src/**` to `lib/`

**Start here when**: you change your code, add/remove plugins, or upgrade dependencies.

#### Phase 2: generate cache

Use `postgraphile --write-cache` (or similar) to write a cache file containing
introspection details of your database.

Generates `lib/postgraphile.cache`

**Start here when**: database schema changes.

`docker-compose start makecache`

#### Phase 3: bundle

Produce a zip file combining the two artifacts above.

Generates `dist/bundle.zip` from `lib/` folder

#### Phase 4 (optional): test

Launch the bundle in the `sam local` test environment.

#### Phase 5: upload

Left as an exercise to the reader.


### Prerequisites

* [docker](https://docs.docker.com/install/)
* [docker-compose](https://docs.docker.com/compose/install/)
* [aws sam cli](https://docs.aws.amazon.com/lambda/latest/dg/sam-cli-requirements.html) - `pip install aws-sam-cli`

### Running it

Copy .env.template to .env and customize as you like:

  cp .env.template .env

Start a database server and build lambda.zip:

    docker-compose up
    # or: docker-compose up -d

Run the test script:

    ./test.sh

Note the first run might take a while whilst the system installs the relevant
docker images.

### Thanks

A utility script from
[vishnubob/wait-for-it](https://github.com/vishnubob/wait-for-it)
prevents the makeCache script from running before postgres has fully started
up.
