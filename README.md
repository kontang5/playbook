# Playbook

Container-based infrastructure playbook for macOS development.

## Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Nginx     │─────→│   Backend   │─────→│ PostgreSQL  │
│   :80       │      │   :3000     │      │   :5432     │
└─────────────┘      └─────────────┘      └─────────────┘
       │                    │                    │
       │                    │ OTLP               │
       ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────┐
│              OTel Collector :4317/:4318             │
│         (logs, metrics, traces)                     │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │   OpenObserve   │
                 │     :5080       │
                 └─────────────────┘
```

## Components

| Component | Port | Description |
|-----------|------|-------------|
| Nginx | 80 | Reverse proxy, static files |
| Backend | 3000 | Node.js demo API |
| PostgreSQL | 5432 | Database (v18) |
| OTel Collector | 4317, 4318 | Telemetry collection |
| OpenObserve | 5080 | Observability UI |

## Quick Start

```bash
# 1. Copy environment files
cp .env.example .env
cp database/.env.example database/.env
cp backend/demo/.env.example backend/demo/.env
cp observability/.env.example observability/.env

# 2. Edit .env files with your credentials

# 3. Start all services
./start.sh

# 4. Verify
open http://localhost        # Nginx
open http://localhost:5080   # OpenObserve
```

## Stop

```bash
./stop.sh
```

## Directory Structure

```
playbook/
├── start.sh / stop.sh       # Orchestration scripts
├── .env.example             # Root environment template
│
├── database/
│   ├── docker-compose.yml
│   ├── .env.example
│   └── postgres/
│       ├── postgresql.conf  # JSON logging, file-based
│       └── init/init.sh     # Creates demo db + users
│
├── backend/demo/
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── .env.example
│   └── src/
│       ├── app.js           # Express API
│       └── instrumentation.js # OTel SDK
│
├── nginx/
│   ├── docker-compose.yml
│   ├── nginx.conf           # JSON access log
│   ├── conf.d/
│   │   ├── default.conf     # Reverse proxy config
│   │   └── status.conf      # Metrics endpoint
│   └── www/                 # Static files
│
└── observability/
    ├── docker-compose.yml   # OpenObserve + OTel + log-cleanup
    ├── otel-collector.yaml  # Collector config
    ├── .env.example
    └── observability.md     # Architecture details
```

## Database

| Role | Purpose |
|------|---------|
| `postgres` | Superuser (admin only) |
| `observer` | Monitoring (pg_monitor) |
| `demo_app` | App user for `demo` database |

## Observability

See [observability/observability.md](observability/observability.md) for details.

### Data Flow

| Signal | Source | Method |
|--------|--------|--------|
| Logs | PostgreSQL | File → OTel filelog |
| Logs | Nginx | File → OTel filelog |
| Logs | Backend | OTLP direct |
| Metrics | Backend | OTLP direct |
| Traces | Backend | OTLP direct |
| Metrics | PostgreSQL/Nginx/Docker | OTel receivers (optional) |

### Retention

| Location | Retention |
|----------|-----------|
| Local log files | 7 days |
| OpenObserve | 30 days |

## Networks

| Network | Services |
|---------|----------|
| public-network | Nginx |
| private-network | Nginx, Backend, OTel, OpenObserve |
| db-network | Backend, PostgreSQL, OTel |

## Volumes

| Volume | Purpose |
|--------|---------|
| postgres-data | Database data |
| postgres-logs | PostgreSQL logs |
| nginx-logs | Nginx logs |
| openobserve-data | Observability data |

## Session Notes

### Completed
- [x] Git-push security (.gitignore, .env.example pattern)
- [x] Database: PostgreSQL 18, JSON logging, demo_app user
- [x] Nginx: JSON access logs, reverse proxy
- [x] Backend: OTel instrumentation, winston logging
- [x] Observability: OpenObserve + OTel Collector + log-cleanup

### TODO (next session)
- [ ] Test full stack
- [ ] Review metrics volume, filter if needed
- [ ] Add PostgreSQL/Nginx/Docker metrics scrapers if needed
- [ ] Production hardening (API tokens, SSL, etc.)
