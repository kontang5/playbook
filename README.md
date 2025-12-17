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
    ├── jenkins/
    ├── nginx/
    ├── postgresql/
    ├── redis/
    └── observability/
```

## Jenkins Setup

After running the playbook, Jenkins will be available at `http://localhost:8080`

Get initial admin password:
```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

## Reference

- [Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html)
- [Jenkins](https://www.jenkins.io/doc/)

