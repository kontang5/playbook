#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "=== Stopping all services ==="

echo "Stopping Observability..."
docker compose -f observability/docker-compose.yml down

echo "Stopping Nginx..."
docker compose -f nginx/docker-compose.yml down

echo "Stopping Backend..."
docker compose -f application/demo/docker-compose.yml down

echo "Stopping Database..."
docker compose -f database/docker-compose.yml down

echo ""
echo "=== All services stopped ==="
echo "(Networks and volumes preserved)"
