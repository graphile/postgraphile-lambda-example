#!/bin/bash

## This script is run in the gql docker container

cd /home/node/app/

if ! [ -x "$(command -v zip)" ]; then
    apt-get update && apt-get install zip -y
fi

sudo npm i -g npm@latest
npm i

sleep 3
npm run bundle
