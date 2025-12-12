#!/bin/bash
set -e

echo "Stopping containers..."
docker-compose down --remove-orphans

echo "Rebuilding images..."
docker-compose build --no-cache

echo "Starting containers..."
docker-compose up -d --force-recreate

echo "Reload complete."
