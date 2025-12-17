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
| common | neovim, mise, httpie, curl, zsh plugins, ssh |
| orbstack | OrbStack (Docker alternative) |
| lmstudio | LM Studio |
| nodejs | Node.js |
| jdk | JDK |
| nginx | Nginx reverse proxy |
| postgresql | PostgreSQL database |
| redis | Redis cache (optional) |
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
    ├── nodejs/
    ├── jdk/
    ├── nginx/
    ├── postgresql/
    ├── redis/
    └── observability/
```

## Reference

- [Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html)

