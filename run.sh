#!/bin/bash

pm2 serve client 3000 --name client
cd server
pm2 start npm --name server -- start
