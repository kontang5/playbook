# Playbook

Ansible playbooks for server setup on macOS

## Quick Start

```bash
# Install Ansible
brew install ansible

# Run playbook
ansible-playbook playbook.yml --ask-become-pass
```

## Configuration

Copy and customize your configuration:

```bash
cp default.config.yml config.yml
# Edit config.yml with your preferences
```

### Optional Roles

Enable in `config.yml`:

```yaml
enable_lmstudio: true
enable_redis: true
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

| Service       | URL                        | Port  |
|---------------|----------------------------|-------|
| Jenkins       | http://localhost:8080      | 8080  |
| Nginx         | http://localhost           | 80    |
| PostgreSQL    | localhost                  | 5432  |
| Redis         | localhost                  | 6379  |
| OpenObserve   | http://localhost:5080      | 5080  |
| OTel Collector| grpc://localhost:4317      | 4317  |

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

## Jenkins Setup

Get initial admin password:

```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

## Observability Setup

OpenObserve credentials (default):

- URL: http://localhost:5080
- User: admin@example.com
- Password: admin

Send telemetry to OTel Collector:

```yaml
OTEL_EXPORTER_OTLP_ENDPOINT: http://localhost:4317
```

## Reference

- [Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html)
- [Jenkins](https://www.jenkins.io/doc/)
- [OpenObserve](https://openobserve.ai/docs/)
- [OpenTelemetry](https://opentelemetry.io/docs/)
