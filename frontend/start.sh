#!/bin/sh

echo "Checking and syncing node_modules..."
npm install

echo "Starting Next.js..."
exec npm run dev
