#!/bin/bash

## This script is run in the gql docker container

cd /home/node/app/

if ! [ -x "$(command -v zip)" ]; then
    apt-get update && apt-get install zip -y
fi

npm i -g yarn@latest
yarn install --force

sleep 3
yarn bundle
