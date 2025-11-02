#!/bin/bash
set -e

APP_DIR="$(dirname $(dirname "$0"))"

cd $APP_DIR
echo "Pulling latest code from test branch..."
git fetch origin test
git checkout test
git pull origin test

echo "Rebuilding Docker container..."
docker-compose build

echo "Restarting container..."
docker-compose down
docker-compose up -d

echo "✅ Deployment complete from test branch!"
