#!/bin/bash

## This script is run in the gql docker container

cd /home/node/app/

if ! [ -x "$(command -v zip)" ]; then
    apt-get update && apt-get install zip -y
fi

if [ -f package-lock.json ]; then
  # npm mode
  npm i -g npm@latest
  npm i

  sleep 3
  npm run bundle
else
  # yarn mode
  npm i -g yarn@latest
  yarn install --force

  sleep 3
  yarn bundle
fi
