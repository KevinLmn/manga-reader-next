#!/bin/bash

# Load .env variables
export $(grep -v '^#' .env | xargs)

curl -X GET "$NEXT_PUBLIC_FRONT_END_URL/api/latest" /home/ikebi/manga-reader-front/warm_cache.sh/logfile.log 2>&1
curl -X GET "$NEXT_PUBLIC_FRONT_END_URL/api/popular" /home/ikebi/manga-reader-front/warm_cache.sh/logfile.log 2>&1