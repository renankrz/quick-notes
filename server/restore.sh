#!/bin/bash

source .env

mongorestore \
  --db="$DB_NAME" \
  "dump/$DB_NAME"
