# Playbook

Container-based infrastructure playbook for macOS development.

## Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Nginx     │─────→│   Express   │─────→│ PostgreSQL  │
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

| Component      | Port       | Description                 |
|----------------|------------|-----------------------------|
| Nginx          | 80         | Reverse proxy, static files |
| Express        | 3000       | Node.js demo API            |
| PostgreSQL     | 5432       | Database (v18)              |
| OTel Collector | 4317, 4318 | Telemetry collection        |
| OpenObserve    | 5080       | Observability UI            |

## Quick Start

```bash
# 1. Copy environment files
cp .env.example .env
cp database/.env.example database/.env
cp application/demo/.env.example application/demo/.env
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
├── application/demo/
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── .env.example
│   └── src/
│       ├── app.js           # Express API
│       └── telemetry.js     # OTel SDK
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
    ├── docker-compose.yml   # OpenObserve + OTel Collector
    ├── .env.example
    ├── observability.md     # Architecture details
    └── otel-collector/      # Modular collector configs
        ├── base.yaml        # Extensions, processors, exporters
        ├── application.yaml # App telemetry pipelines
        ├── nginx.yaml       # Nginx metrics/logs
        ├── database.yaml    # PostgreSQL metrics/logs
        └── docker.yaml      # Docker log parsing
```

## Database

| Role       | Purpose                      |
|------------|------------------------------|
| `postgres` | Superuser (admin only)       |
| `observer` | Monitoring (pg_monitor)      |
| `demo_app` | App user for `demo` database |

## Observability

See [observability/observability.md](observability/observability.md) for details.

### Data Flow

| Signal  | Source           | Method              |
|---------|------------------|---------------------|
| Logs    | PostgreSQL       | File → OTel filelog |
| Logs    | Nginx            | File → OTel filelog |
| Logs    | application      | OTLP direct         |
| Metrics | application      | OTLP direct         |
| Traces  | application      | OTLP direct         |
| Metrics | PostgreSQL/Nginx | OTel receivers      |

### Retention

| Location        | Retention |
|-----------------|-----------|
| Local log files | 7 days    |
| OpenObserve     | 30 days   |

## Networks

| Network         | Services                              |
|-----------------|---------------------------------------|
| public-network  | Nginx                                 |
| private-network | Nginx, Application, OTel, OpenObserve |
| db-network      | Application, PostgreSQL, OTel         |

## Volumes

| Volume           | Purpose            |
|------------------|--------------------|
| postgres-data    | Database data      |
| postgres-logs    | PostgreSQL logs    |
| nginx-logs       | Nginx logs         |
| openobserve-data | Observability data |

## DIY

- [ ] Test full stack
- [ ] Review metrics volume, filter if needed
- [ ] Production hardening (API tokens, SSL, etc.)
