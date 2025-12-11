const {OTLPTraceExporter} = require('@opentelemetry/exporter-trace-otlp-http');

const {OTEL_ENDPOINT} = require('./config');

const traceExporter = new OTLPTraceExporter({
    url: `${OTEL_ENDPOINT}/v1/traces`,
});

module.exports = {traceExporter};
