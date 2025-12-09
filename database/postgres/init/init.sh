#!/bin/bash
# PostgreSQL initialization script
# Runs on first container initialization
#
# Environment variables:
#   POSTGRES_OBSERVER_PASSWORD - password for observer role
#   POSTGRES_DEMO_DB - demo database name
#   POSTGRES_DEMO_USER - demo app user
#   POSTGRES_DEMO_PASSWORD - demo app password

set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Observer role for monitoring (postgres-exporter)
    CREATE ROLE observer WITH LOGIN PASSWORD '$POSTGRES_OBSERVER_PASSWORD';

    -- Grant monitoring permissions
    GRANT pg_monitor TO observer;
    GRANT SELECT ON ALL TABLES IN SCHEMA pg_catalog TO observer;
    GRANT SELECT ON ALL TABLES IN SCHEMA information_schema TO observer;

    -- Demo app database and user
    CREATE DATABASE $POSTGRES_DEMO_DB;
    CREATE ROLE $POSTGRES_DEMO_USER WITH LOGIN PASSWORD '$POSTGRES_DEMO_PASSWORD';
    GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DEMO_DB TO $POSTGRES_DEMO_USER;
EOSQL

# Grant schema privileges (must connect to demo db)
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DEMO_DB" <<-EOSQL
    GRANT ALL ON SCHEMA public TO $POSTGRES_DEMO_USER;
EOSQL
