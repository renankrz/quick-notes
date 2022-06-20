#!/bin/bash

source .env

mongodump \
  --db="$DB_NAME" \
  --out="dump/"
