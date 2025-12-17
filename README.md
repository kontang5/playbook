# Playbook

Ansible playbooks for server setup on macOS

## Quick Start

```bash
# Install Ansible
brew install ansible

# Install dependencies
ansible-galaxy collection install -r requirements.yml

# Run playbook
ansible-playbook playbook.yml --ask-become-pass
```

## Configuration

Copy and customize your configuration:

```bash
cp config.yml.example config.yml
# Edit config.yml with your credentials and preferences
```

### Optional Roles

Enable in `config.yml`:

```yaml
enable_lmstudio: true
enable_redis: true
```

### Run Specific Roles

Use tags to run specific roles:

```bash
ansible-playbook playbook.yml --tags nginx
ansible-playbook playbook.yml --tags postgresql,redis
```

## Roles

| Role          | Description                                  |
|---------------|----------------------------------------------|
| common        | neovim, mise, httpie, curl, zsh plugins, ssh |
| orbstack      | OrbStack (Docker alternative)                |
| lmstudio      | LM Studio (optional)                         |
| jenkins       | Jenkins CI/CD server                         |
| nginx         | Nginx reverse proxy                          |
| postgresql    | PostgreSQL database                          |
| redis         | Redis cache (optional)                       |
| observability | OpenObserve + OTel Collector                 |

## Services

After running the playbook:

| Service        | URL                   | Port | Version                                      |
|----------------|-----------------------|------|----------------------------------------------|
| Jenkins        | http://localhost:8080 | 8080 | jenkins/jenkins:2.479.3-lts                  |
| Nginx          | http://localhost      | 80   | nginx:1.28.0-alpine                          |
| PostgreSQL     | localhost             | 5432 | postgres:18-alpine                           |
| Redis          | localhost             | 6379 | redis:8.4.0-alpine                           |
| OpenObserve    | http://localhost:5080 | 5080 | openobserve/openobserve:v0.30.0              |
| OTel Collector | grpc://localhost:4317 | 4317 | otel/opentelemetry-collector-contrib:0.142.0 |

### Directory Structure

```
~/Sites/
├── jenkins/
├── nginx/
│   ├── conf.d/
│   └── html/
├── postgresql/
├── redis/
└── observability/
```

## Setup

### Jenkins

Get initial admin password:

```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

### Observability

OpenObserve credentials are configured in `config.yml`:

- URL: http://localhost:5080
- User: `openobserve_user`
- Password: `openobserve_password`

Send telemetry to OTel Collector:

```yaml
OTEL_EXPORTER_OTLP_ENDPOINT: http://localhost:4317
```

## Reference

- [Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html)
- [Jenkins](https://www.jenkins.io/doc/)
- [OpenObserve](https://openobserve.ai/docs/)
- [OpenTelemetry](https://opentelemetry.io/docs/)
