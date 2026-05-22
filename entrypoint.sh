#!/bin/sh

# Ensure the node user owns the data directory and its contents
# This is necessary because if a volume is mounted from the host,
# it might be owned by root, causing permission denied errors for SQLite.
chown -R node:node /app/data

# Execute the main command dropping root privileges
exec su-exec node "$@"
