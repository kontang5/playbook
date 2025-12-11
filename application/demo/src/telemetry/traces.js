const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');

const OTEL_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://otel-collector:4318';

const traceExporter = new OTLPTraceExporter({
  url: `${OTEL_ENDPOINT}/v1/traces`,
});

module.exports = { traceExporter };
