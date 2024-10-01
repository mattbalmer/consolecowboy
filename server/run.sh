#!/bin/bash

rm ../shared/@env/*.js
rm ../shared/@env/*.js.map

if [ "$2" == "watch" ];
then
  echo "Starting in 'watch' mode"
  ENV=$1 NODE_PATH=./source ts-node-dev -r tsconfig-paths/register ./source/run.ts
else
  echo "Starting in 'normal' mode"
  ENV=$1 NODE_PATH=./source ts-node -r tsconfig-paths/register ./source/run.ts
fi