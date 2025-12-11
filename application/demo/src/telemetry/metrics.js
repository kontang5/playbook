const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const { PeriodicExportingMetricReader, AggregationType } = require('@opentelemetry/sdk-metrics');
const { metrics } = require('@opentelemetry/api');

const OTEL_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://otel-collector:4318';

// Metrics exporter
const metricExporter = new OTLPMetricExporter({
  url: `${OTEL_ENDPOINT}/v1/metrics`,
});

// Metric reader for SDK
const metricReader = new PeriodicExportingMetricReader({
  exporter: metricExporter,
  exportIntervalMillis: 10000,
});

// Views to drop auto-instrumentation metrics (keep traces)
const metricViews = [
  // Drop pg metrics (db_client_*) - traces already cover DB duration
  {
    meterName: '@opentelemetry/instrumentation-pg',
    aggregation: { type: AggregationType.DROP },
  },
  // Drop http metrics - we use custom gauge instead
  {
    meterName: '@opentelemetry/instrumentation-http',
    aggregation: { type: AggregationType.DROP },
  },
];

// Track duration internally for averaging
let totalDuration = 0;
let requestCount = 0;

// Initialize metrics (call after SDK starts)
const initMetrics = () => {
  const meter = metrics.getMeter('backend');

  // Observable gauge - reports average duration each collection
  meter.createObservableGauge('http.server.request.duration.avg', {
    description: 'Average HTTP request duration in seconds',
    unit: 's',
  }).addCallback((gauge) => {
    if (requestCount > 0) {
      gauge.observe(totalDuration / requestCount);
      // Reset for next interval
      totalDuration = 0;
      requestCount = 0;
    }
  });
};

// Track a request duration (called from app.js middleware)
const trackRequest = (durationSec) => {
  totalDuration += durationSec;
  requestCount += 1;
};

module.exports = {
  metricReader,
  metricViews,
  initMetrics,
  trackRequest,
};
