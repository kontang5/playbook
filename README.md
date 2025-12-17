# Playbook

Ansible playbooks for server setup on macOS

## Quick Start

```bash
# Install Ansible
brew install ansible

# Run playbook
ansible-playbook playbook.yml
```

## Configuration

Copy and customize your configuration:

```bash
cp default.config.yml config.yml
# Edit config.yml with your preferences
```

## Roles

| Role | Description |
|------|-------------|
| common | Homebrew and basic setup |
| orbstack | OrbStack (Docker alternative) |
| lmstudio | LM Studio |
| nginx | Nginx reverse proxy |
| postgresql | PostgreSQL database |
| redis | Redis cache |
| observability | OpenObserve + OTel Collector |

## Structure

```
playbook/
├── ansible.cfg
├── inventory
├── playbook.yml
├── config.yml
├── default.config.yml
└── roles/
    ├── common/
    ├── orbstack/
    ├── lmstudio/
    ├── nginx/
    ├── postgresql/
    ├── redis/
    └── observability/
```

## Reference

- [Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html)

