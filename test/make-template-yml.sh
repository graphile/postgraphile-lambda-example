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
          DATABASE_URL: "postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@host.docker.internal:54321/${POSTGRES_DB}"
          DATABASE_SCHEMAS: "${DATABASE_SCHEMAS}"
          JWT_SECRET: "${JWT_SECRET}"
      Runtime: nodejs8.10
      Handler: index.handler
      Timeout: 30
      CodeUri: ./src/lambda.zip
      Events:
        Api:
          Type: Api
          Properties:
            Path: /graphql
            Method: post
HERE
