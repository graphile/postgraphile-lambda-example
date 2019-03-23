# PostGraphile Lambda Example

## Overview

This project shows an example of how you might use PostGraphile on Lambda. It
has the following aims:

- [x] Startup without needing to introspect database
- [x] Fast startup
- [x] Small bundle size
- [x] JWT auth supported OOTB
- [x] Graphile-build schema plugin support
- [x] Support for middlewares
- [x] No requirement for Node.js `http`-based libraries (such as Connect,
      Express, Koa)

## Non-goals

Postgraphile-lambda-example does NOT intend to watch the schema for changes;
this means that you _must_ build and release a new version every time you
change your database. (You only need to update the cache file though.)

Postgraphile-lambda-example does NOT intend to make this fully compatible with
the `postgraphile` CLI - this will be a subset best suited to Lambda usage.

Postgraphile-lambda-example does NOT intend to support subscriptions.

## Method

We use the following tools:

- webpack - to bundle up the required code into as small a file as possible
  (no need for `node_modules` any more!)
- PostGraphile `writeCache` / `readCache` - we'll introspect the database
  during the build and write the results to a cache file to be included in the
  bundle; then when the Lambda service starts up it can read from the cache
  rather than introspecting the database again.
- serverless.js (optional) - for automated AWS deployments.

## Setup

First clone this repository locally, and install dependencies:

```
yarn
```

Next, set up a `.env` file matching your environment:

```
cp .env.template .env
```

And modify the `src/postgraphileOptions.js` and `serverless.yml` files to your taste.

#### AWS VPC settings

When you're deploying Postgraphile using Lambda, you can run your DB instance on AWS as well in order to make use of AWS's integrated security using VPCs. In that case you can restrict the public accessibility of your DB instance from the internet. *If you don't host your DB on AWS you can ignore this section.*

When using RDS for example, our use case **requires two ways of access**:

1. The Postgraphile Lambda function we will create needs access to the RDS instance. We achieve that by creating the Lambda function within the same VPC our RDS instance lives in.
2. In some use cases that's all you need and you can completely hide the RDS from public access and only make it accessible from within the VPC (at a later point in production you might even do it that way). In our case this would be a bit inconvenient because our Postgraphile scripts need to access the DB during schema generation and this process runs on our local machine. Therefore we add the ability to access the DB instance publicly, though restricted to our current IP. (The ability to connect to the DB from our local system is helpful in many other situations as well, e.g. when running migrations or when accessing the database through a DB client.)

Achieving this can be a bit confusing if you're new to VPCs. When you create your RDS instance, set the following "Network & Security" settings:

- VPC & subnet group: default (RDS instances are always created within a VPC and your AWS account comes with its default VPC)
- Public accessibility: Yes (this is for our second requirement, but don't expect that this alone will make your RDS instance publicly accessible: access is always regulated through your security group settings and if there is no rule there that allows public access, then setting "yes" here does not in any way expose your instance)
- VPC security groups: We actually need two different security groups. Just select "Create new VPC security group" here. Then RDS will automatically create a new security group with an inbound rule of type `PostgresQL` restricted to your current IP address as source. This will satisfy our second requirement. After you created your instance, click on "Modify" and return to your security group settings. Now add the `default` security group as the second one. This security group allows other entities within the VPC (e.g. our Lambda function) to access this entity (the RDS instance) which is needed for our first requirement. You might have expected that entities are able to access other entities within the same VPC by default, but you have to add this security group explicitly.

If you want to learn more, here's some more info on [VPCs in the context of RDS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_VPC.WorkingWithRDSInstanceinaVPC.html) and on [security groups](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_SecurityGroups.html).

Now, we just have to make sure that our Lambda is created within our VPC as well. For that just use the AWS_VPC environment variables from the `.env.template` and add the following to the specifications of your `graphql` function in your `serverless.yml` file:

```
vpc:
  securityGroupIds:
    "Fn::Split":
      - ","
      - ${env:AWS_VPC_SECURITY_GROUP_IDS}
  subnetIds:
    "Fn::Split":
      - ","
      - ${env:AWS_VPC_SUBNET_IDS}
```

You can find all these values in the RDS console under "Connectivity & Security". (As the securityGroupId it's enough to use the `default` one: this basically makes the Lambda function part of the VPC. There should be 3 subnetIds.)

(You will also need to add `"iam:AttachRolePolicy"` to the permissions of the Serverless IAM role policy you will later create.)

Hint: Don't forget that your access to RDS from your local computer is based on your current network, so when you want to e.g. re-generate the Postgraphile schema, but are now connected to a different network, you'll have to return to the `rds-launch-wizard` security group settings, edit the inbound rule and select "My IP" at source to automatically update your IP.

## Automatic Deployment with Serverless.js

This repository runs bash scripts during deployment written on Mac which you can find in the `scripts` folder. These scripts should run just fine on Mac and Linux, but you might run into problems on Windows. As a workaround you can just run Linux within Windows and run the deployment scripts there. If you're on Windows 10 you can install a command line Linux distro from the Microsoft Store - there is a guide further below. If you're using another version of Windows, you could run Linux in a VM (or possibly a Docker container).

#### On Mac/Linux

- install [serverless](https://serverless.com/framework/docs/providers/aws/guide/installation/) - `yarn global add serverless`
- Make sure you configured your [aws credentials](https://serverless.com/framework/docs/providers/aws/guide/credentials/) - if you're doing that for the first time, just create the IAM role and then use the aws-cli method as described in the link (Hint: make sure that the IAM role policy you copied from the gist contains `"s3:GetBucketLocation"`)

Now you can deploy to AWS using serverless.js by running:

```
yarn deploy
```

#### On Windows 10

- After you completed the steps in [Setup](#setup), go to the Microsoft Marketplace in the start menu and install a command line linux distro of your choice (we use ubuntu 18.04 in these instructions).
- Run ubuntu and create a user and password.
- Run `sudo apt update` to get access to the latest packages.
- Install and activate a virtual environment: Follow the steps in [this tutorial](https://linuxize.com/post/how-to-create-python-virtual-environments-on-ubuntu-18-04/) until after the activation. From now on, always keep running within the virtual environment. (Why we do this: We will use the `aws-cli` to provide serverless with AWS credentials to create the stack on AWS on your behalf. `aws-cli` relies on python3 which is also used by the Linux system, but in a different version. In order to avoid version conflicts/incompatibilites, we install the `aws-cli` in a virtual environment which comes with its own python installation.)
- Install the aws-cli by running `pip install --upgrade awscli` (from within the venv). You can make sure it installed correctly by running `aws --version`.
- If you haven't already done that, create an IAM role for serverless as described [here](https://serverless.com/framework/docs/providers/aws/guide/credentials/). (Hint: Make sure that the IAM role policy you copied from the gist contains `"s3:GetBucketLocation"`.)
- Save the credentials to aws-cli by running `aws configure` ([more details](https://serverless.com/framework/docs/providers/aws/guide/credentials#setup-with-the-aws-cli)).
- Install yarn (you do need to use yarn and not npm because the scripts use yarn) as described on [their website](https://yarnpkg.com/lang/en/docs/install/#debian-stable), serverless with `yarn global add serverless` and zip with `sudo apt-get install zip`.
- Cd to your postgraphile project folder you created during setup and run `yarn deploy`.

#### After deployment

Just copy the URL that Serverless returns in the command line under `endpoints` after successful deployment and paste it into your GraphQL client of choice - you can now talk to your Lambda PostGraphile API 😅

## Setting up a Lambda endpoint manually

If you prefer not to use the serverless.js framework, you can also deploy your lambda function manually.

Note 1: Change your process.env.AWS_STAGE_NAME to "/default" to match the default stage name for manually deployed API Gateways.

Note 2: CORS is enabled by default. Remove cors() middleware in `/src/index.js` if you would prefer disabled cors.

0. Run `yarn build` to create `lambda.zip` file that you can upload to Amazon Lambda.
1. Visit https://console.aws.amazon.com/lambda/home and click 'Create function'
2. Select "Author from scratch" and give your function a name, select the most recent Node.js release (at least 8.10+), create (or select) a role (I granted "Simple microservice permissions")
3. Click "Create function" and wait about 15 seconds; you should be greeted with a "Congratulations" message.
4. Scroll to "Function code", select "Upload a .zip file" from "Code entry type", press the "Upload" button and select the `lambda.zip` file you generated above; then click "Save"
5. Scroll to "Environment variables" and enter your `DATABASE_SCHEMAS` and `DATABASE_URL` settings; then click "Save"
6. Scroll to the top and select "API Gateway" under "Add triggers" in the "Designer", then scroll to "Configure triggers"
7. Create a new API; if you like add 'image/gif', 'image/png', 'image/icon' and 'image/x-icon' to the list of binary media types; then press "Add" followed by "Save"
8. Click the name of the API gateway to go to the API gateway config
9. Select the `/` route under `Resources` and from the "Actions" dropdown, select "Create method" add create an `ANY` method
10. Turn on "Lambda Proxy Integration" and enter your lambda function name in the relevant box, then press "Save"
11. Finally, go to "Actions" again and "Deploy API"
12. Copy the "Invoke URL" and paste it into your GraphQL client of choice - you can now talk to your Lambda PostGraphile API 😅

If you want GraphiQL support (STRONGLY DISCOURAGED! Use an external GraphQL
client such as GraphiQL.app, Altair or GraphQL Playground instead!), then you
need to go back to stage 9, and choose 'Create Resource', tick "Configure as a
proxy resource", press "Create Resource" and then configure it with the name of
your lambda function, you should also change the settings in
`src/postgraphileOptions.js` (see comment in that file).

## How it works

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

### Test Prerequisites

- [docker](https://docs.docker.com/install/)
- [aws sam cli](https://docs.aws.amazon.com/lambda/latest/dg/sam-cli-requirements.html) - `pip install aws-sam-cli`

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
./scripts/import-example-database
```

Make sure that the query in `test/query.graphql` and the options in `src/postgraphileOptions.js` are both valid for your database. If you're using a remote PostgreSQL server (or one within a docker instance), you may need to update the `host.docker.internal` reference in `test/make-template-yml.sh` (line 15).

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

This will set up a local GraphQL endpoint at http://127.0.0.1:3000/graphql

You can then use a GraphQL client such as Altair or GraphQL Playground to issue requests.

If you're using the sample database then you can generate a JWT via:

```graphql
mutation {
  authenticate(input: { email: "spowell0@noaa.gov", password: "iFbWWlc" }) {
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

### Troubleshooting

- If you receive serverless errors during `yarn deploy`, sometimes they can be resolved by just running the command another time. At the time of writing (20/Mar/2019), there is also a temporal error with Serverless v1.39: "Can't find graphql.zip file". If this happens downgrade to Serverless 1.38 by running `yarn global add serverless@1.38`.
- If your serverless stack is created successfully, but then your endpoint throws some unhelpful errors, check the Cloudwatch logs of the Lambda. If you notice that the Lambda just times out, you might try checking the security settings of your DB instance. For example, if you use RDS with the "public" setting enabled, the public access might be restricted to your IP address. This would result in the schema being successfully generated during stack creation from your device, but the Lambda not having access obviously (without any error messages hinting you in that direction). You can quick-fix that by setting the inbound settings of the security group of the RDS instance to all IPs (or even better by [making the Lambda access RDS from within the VCP](#aws-vpc-settings))
- If you want to remove your stack from AWS and you try running `serverless remove`, you may run into errors. If that happens, you can go to Cloudformation in the AWS console and delete your stack there.

### Thanks

Improvements to PostGraphile's support for Lambda were sponsored by [Connecting Good](https://cogo.co/)
