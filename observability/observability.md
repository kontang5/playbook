# Observability Architecture

## Overview

Centralized observability using OpenTelemetry Collector and OpenObserve.

```
┌──────────────┐  JSON logs    ┌─────────────────┐
│  PostgreSQL  │──────────────→│  postgres-logs  │──┐
└──────────────┘               └─────────────────┘  │
                                                    │  filelog receiver
┌──────────────┐  JSON logs    ┌─────────────────┐  │
│    Nginx     │──────────────→│   nginx-logs    │──┼──→┌────────────────┐    OTLP    ┌─────────────┐
└──────────────┘               └─────────────────┘  │   │                │───────────→│             │
                                                    │   │ OTel Collector │            │ OpenObserve │
┌──────────────┐  OTLP direct                       │   │                │───────────→│  (30 days)  │
│   Demo API   │────────────────────────────────────┴──→│                │            │             │
└──────────────┘  logs + metrics + traces               └────────────────┘            └─────────────┘
                                                               ▲
┌──────────────┐  docker_stats                                 │
│   Containers │───────────────────────────────────────────────┘
└──────────────┘

┌─────────────────────────────────────────────────┐
│  log-cleanup (cron: delete >7 days from volumes)│
└─────────────────────────────────────────────────┘
```

## Components

| Component | Purpose | Port |
|-----------|---------|------|
| OpenObserve | Storage & UI for logs/metrics/traces | 5080 |
| OTel Collector | Collect and forward telemetry | 4317 (gRPC), 4318 (HTTP) |
| log-cleanup | Rotate local log files (7 days) | - |

## Data Sources

### Logs

| Source | Method | Format |
|--------|--------|--------|
| PostgreSQL | File-based → filelog receiver | JSON |
| Nginx | File-based → filelog receiver | JSON |
| Demo API | Direct OTLP from SDK | OTLP |

### Metrics

| Source | Method | Receiver |
|--------|--------|----------|
| PostgreSQL | Direct connection | `postgresql` receiver |
| Nginx | stub_status endpoint (internal :8080) | `nginx` receiver |
| Demo API | Direct OTLP from SDK | `otlp` receiver |
| Containers | Docker socket | `docker_stats` receiver |

### Traces

| Source | Method |
|--------|--------|
| Demo API | OTLP from API-logs |

## Retention Policy

| Location | Retention | Method |
|----------|-----------|--------|
| Local log files | 7 days | log-cleanup cron container |
| OpenObserve | 30 days | `ZO_COMPACT_DATA_RETENTION_DAYS` |

## Configuration Files

```
observability/
├── docker-compose.yml      # OpenObserve + OTel Collector + log-cleanup
├── otel-collector.yaml     # Collector receivers, processors, exporters
└── .env.example            # OpenObserve credentials + ingestion token
```

## Authentication

OTel Collector uses an **ingestion token** to authenticate with OpenObserve. This is more secure than using root credentials.

### Setup Steps

1. Start OpenObserve: `docker compose up -d openobserve`
2. Login to UI at `http://localhost:5080` with root credentials
3. Go to **Ingestion** → **Data sources**
4. Copy the ingestion token (already base64 encoded)
5. Add to `.env`: `ZO_INGESTION_TOKEN=<copied-token>`
6. Start the collector: `docker compose up -d otel-collector`

## OTel Collector Receivers

```yaml
receivers:
  # Logs from files
  filelog/postgres:
    include: [/logs/postgres/*.log]
  filelog/nginx:
    include: [/logs/nginx/access.log]
  filelog/nginx-error:
    include: [/logs/nginx/error.log]

  # Direct from API
  otlp:
    protocols:
      grpc:
      http:

  # Metrics
  postgresql:
    endpoint: postgres:5432
    username: observer
    password: ${POSTGRES_OBSERVER_PASSWORD}
  nginx:
    endpoint: http://nginx:8080/stub_status
  docker_stats:
    endpoint: unix:///var/run/docker.sock
```
