const {resourceFromAttributes} = require('@opentelemetry/resources');
const pkg = require('../../package.json');

const OTEL_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://otel-collector:4318';

const resource = resourceFromAttributes({
    'service.name': process.env.OTEL_SERVICE_NAME || pkg.name,
    'service.version': pkg.version,
});

module.exports = {OTEL_ENDPOINT, resource};
