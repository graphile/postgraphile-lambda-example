#!/bin/bash
if [ -x "./.env" ]; then
  . ./.env;
fi;
cat > template.yml <<HERE
AWSTemplateFormatVersion : '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: PostGraphile as a Lambda Function
Resources:
  graphql:
    Type: AWS::Serverless::Function
    Properties:
      Environment:
        Variables:
          DATABASE_URL: "postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@host.docker.internal:5432/${POSTGRES_DB}"
          DATABASE_SCHEMAS: "${DATABASE_SCHEMAS}"
          JWT_SECRET: "${JWT_SECRET}"
      Runtime: nodejs8.10
      Handler: index.handler
      Timeout: 30
      CodeUri: ../lambda.zip
      Events:
        Api:
          Type: Api
          Properties:
            Path: /graphql
            Method: post
        OptionsRoute:
          Type: Api
          Properties:
            Path: /graphql
            Method: options
        Favicon:
          Type: Api
          Properties:
            Path: /favicon.ico
            Method: get
        Graphiql:
          Type: Api
          Properties:
            Path: /graphiql
            Method: get
Globals:
  Api:
    BinaryMediaTypes:
      # These are equivalent to image/gif and image/png when deployed
      - image~1gif
      - image~1png
      - image~1icon
      - image~1x-icon
HERE
