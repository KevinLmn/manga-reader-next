#!/bin/sh

# Start cron
crond -b

# Create cron job file if not present
if [ ! -f /var/spool/cron/crontabs/root ]; then
  echo "0 * * * * cd /app/backend && node dist/scripts/warmCache.js >> /var/log/warmcache.log 2>&1" > /var/spool/cron/crontabs/root
  chmod 600 /var/spool/cron/crontabs/root
fi

# Initialize database if needed
/app/init-db.sh

# Start the app in the background
node /app/backend/dist/index.js &
SERVER_PID=$!

# Wait for server to be ready
echo "Waiting for server to start..."
until curl -s http://localhost:3012/health > /dev/null; do
  sleep 1
done
echo "Server is ready!"

# Run warm cache script
cd /app/backend && node dist/scripts/warmCache.js

# Wait for the server process
wait $SERVER_PID
