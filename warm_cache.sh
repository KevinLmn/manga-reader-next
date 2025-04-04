#!/bin/bash

# Load .env variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo "Error: .env file not found"
    exit 1
fi

# Create logs directory if it doesn't exist
mkdir -p logs

echo "Warming up cache..."

# Warm up latest manga cache
echo "Fetching latest manga..."
curl -X GET "$NEXT_PUBLIC_FRONT_END_URL/api/latest" -o /dev/null -s -w "Latest manga: %{http_code}\n"

# Warm up popular manga cache
echo "Fetching popular manga..."
curl -X GET "$NEXT_PUBLIC_FRONT_END_URL/api/popular" -o /dev/null -s -w "Popular manga: %{http_code}\n"

echo "Cache warming complete!"