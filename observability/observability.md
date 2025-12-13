# Observability Architecture

## Overview

Centralized observability using OpenTelemetry Collector and OpenObserve.

```
┌──────────────┐
│  PostgreSQL  │──┐
└──────────────┘  │
                  │  Docker logs
┌──────────────┐  │  (filelog receiver)
│    Nginx     │──┼──→┌────────────────┐    OTLP    ┌─────────────┐
└──────────────┘  │   │                │───────────→│             │
                  │   │ OTel Collector │            │ OpenObserve │
┌──────────────┐  │   │                │───────────→│  (30 days)  │
│   Demo API   │──┴──→│                │            │             │
└──────────────┘      └────────────────┘            └─────────────┘
  OTLP direct
  (logs+metrics+traces)
```

## Components

| Component      | Purpose                              | Port                     |
|----------------|--------------------------------------|--------------------------|
| OpenObserve    | Storage & UI for logs/metrics/traces | 5080                     |
| OTel Collector | Collect and forward telemetry        | 4317 (gRPC), 4318 (HTTP) |

## Data Sources

### Logs

| Source     | Method                         | Format |
|------------|--------------------------------|--------|
| PostgreSQL | Docker logs → filelog receiver | JSON   |
| Nginx      | Docker logs → filelog receiver | JSON   |
| Demo API   | Direct OTLP from SDK           | OTLP   |

### Metrics

| Source     | Method                                | Receiver              |
|------------|---------------------------------------|-----------------------|
| PostgreSQL | Direct connection                     | `postgresql` receiver |
| Nginx      | stub_status endpoint (internal :8080) | `nginx` receiver      |
| Demo API   | Direct OTLP from SDK                  | `otlp` receiver       |

### Traces

| Source   | Method               |
|----------|----------------------|
| Demo API | OTLP direct from SDK |

## Retention Policy

| Location    | Retention      | Method                           |
|-------------|----------------|----------------------------------|
| Docker logs | 30MB/container | Docker log rotation              |
| OpenObserve | 30 days        | `ZO_COMPACT_DATA_RETENTION_DAYS` |

## Configuration Files

```
observability/
├── docker-compose.yml      # OpenObserve + OTel Collector
├── .env.example            # OpenObserve credentials + ingestion token
└── otel-collector/         # Modular collector configs
    ├── base.yaml           # Extensions, common processors, exporters
    ├── docker.yaml         # Docker log collection (filelog receiver)
    ├── routing.yaml        # Log classification, filtering, routing
    ├── application.yaml    # App telemetry pipelines (OTLP receiver)
    ├── nginx.yaml          # Nginx metrics/logs
    └── database.yaml       # PostgreSQL metrics/logs
```

## Authentication

OTel Collector uses an **ingestion token** to authenticate with OpenObserve. This is more secure than using root
credentials.

### Setup Steps

1. Start OpenObserve: `docker compose up -d openobserve`
2. Login to UI at `http://localhost:5080` with root credentials
3. Go to *Ingestion* → *Data sources*
4. Copy the ingestion token (already base64 encoded)
5. Add to `.env`: `ZO_INGESTION_TOKEN=<copied-token>`
6. Start the collector: `docker compose up -d otel-collector`

## OTel Collector Receivers

```yaml
receivers:
  # Logs from Docker container logs
  filelog/docker:
    include: [/var/lib/docker/containers/*/*.log]

  # Direct from application
  otlp:
    protocols:
      grpc:   # 4317
      http:   # 4318

  # Metrics
  postgresql:
    endpoint: postgres:5432
  nginx:
    endpoint: http://nginx:8080/stub_status
```
