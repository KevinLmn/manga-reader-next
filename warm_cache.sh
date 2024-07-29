#!/bin/bash

curl -X GET http://localhost:3005/api/latest /home/ikebi/manga-reader-front/warm_cache.sh/logfile.log 2>&1
curl -X GET http://localhost:3005/api/popular /home/ikebi/manga-reader-front/warm_cache.sh/logfile.log 2>&1