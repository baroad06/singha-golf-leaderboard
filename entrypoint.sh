#!/bin/bash
set -e

# Run scraper once on startup (optional - can be triggered via /api/refresh instead)
echo "Starting scraper..."
node rescrape_all16.js

echo "Starting server..."
exec node server.js
