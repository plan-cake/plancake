#!/bin/sh
set -e

echo "Checking and syncing node_modules..."
npm install

echo "Starting Next.js..."
exec npm run dev
