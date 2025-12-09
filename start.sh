#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "=== Creating networks and volumes ==="
docker network create public-network 2>/dev/null || true
docker network create private-network 2>/dev/null || true
docker network create db-network 2>/dev/null || true
docker volume create postgres-data 2>/dev/null || true
docker volume create postgres-logs 2>/dev/null || true
docker volume create nginx-logs 2>/dev/null || true
docker volume create openobserve-data 2>/dev/null || true

echo ""
echo "=== Starting Database ==="
docker compose -f database/docker-compose.yml up -d
echo "Waiting for PostgreSQL to be healthy..."
until docker exec postgres pg_isready -U postgres > /dev/null 2>&1; do
  sleep 2
done
echo "PostgreSQL is ready!"

echo ""
echo "=== Starting Backend ==="
docker compose -f backend/demo/docker-compose.yml up -d --build

echo ""
echo "=== Starting Nginx ==="
docker compose -f nginx/docker-compose.yml up -d

echo ""
echo "=== Starting Observability ==="
docker compose -f observability/docker-compose.yml up -d

echo ""
echo "=== All services started ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
