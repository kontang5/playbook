const {OTLPMetricExporter} = require('@opentelemetry/exporter-metrics-otlp-http');
const {PeriodicExportingMetricReader, AggregationType} = require('@opentelemetry/sdk-metrics');
const {metrics} = require('@opentelemetry/api');

const {OTEL_ENDPOINT} = require('./config');

// Metric exporter and reader
const metricExporter = new OTLPMetricExporter({
    url: `${OTEL_ENDPOINT}/v1/metrics`,
});

const metricReader = new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 10000,
});

// Views to drop auto-instrumentation metrics
const metricViews = [
    {meterName: '@opentelemetry/instrumentation-pg', aggregation: {type: AggregationType.DROP}},
    {meterName: '@opentelemetry/instrumentation-http', aggregation: {type: AggregationType.DROP}},
];

// Track duration for averaging
let totalDuration = 0;
let requestCount = 0;

// Initialize observable gauge
const initMetrics = () => {
    const meter = metrics.getMeter('backend');

    meter.createObservableGauge('http.server.request.duration.avg', {
        description: 'Average HTTP request duration in seconds',
        unit: 's',
    }).addCallback((gauge) => {
        if (requestCount > 0) {
            gauge.observe(totalDuration / requestCount);
            totalDuration = 0;
            requestCount = 0;
        }
    });
};

// Track request duration
const trackRequest = (durationSec) => {
    totalDuration += durationSec;
    requestCount += 1;
};

module.exports = {metricReader, metricViews, initMetrics, trackRequest};
