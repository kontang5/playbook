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
| lmstudio | LM Studio for local LLMs |
| nginx | Nginx via Docker Compose |
| postgresql | PostgreSQL via Docker Compose |
| redis | Redis via Docker Compose |

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
    └── redis/
```

## Reference

- [Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html)

