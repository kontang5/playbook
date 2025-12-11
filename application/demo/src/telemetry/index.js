const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { resourceFromAttributes } = require('@opentelemetry/resources');

const { traceExporter } = require('./traces');
const { logExporter, initLoggerProvider, createLogger } = require('./logs');
const { metricReader, metricViews, initMetrics, trackRequest } = require('./metrics');

const pkg = require('../../package.json');

// Resource attributes (SDK 2.x uses resourceFromAttributes instead of new Resource)
const resource = resourceFromAttributes({
  'service.name': process.env.OTEL_SERVICE_NAME || pkg.name,
  'service.version': pkg.version,
});

// Initialize logger provider
const loggerProvider = initLoggerProvider(resource);

// Create SDK
const sdk = new NodeSDK({
  resource,
  traceExporter,
  metricReader,
  views: metricViews,
  instrumentations: [
    getNodeAutoInstrumentations({
      // Disable noisy/unnecessary instrumentations
      '@opentelemetry/instrumentation-fs': { enabled: false },
      '@opentelemetry/instrumentation-dns': { enabled: false },
      '@opentelemetry/instrumentation-net': { enabled: false },
      // Disable runtime metrics (v8js_*, nodejs_eventloop_*)
      '@opentelemetry/instrumentation-runtime-node': { enabled: false },
      // Drop Express middleware spans (expressInit, query, etc.)
      '@opentelemetry/instrumentation-express': {
        ignoreLayersType: ['middleware'],
      },
    }),
  ],
});

// Start SDK
sdk.start();

// Initialize metrics after SDK starts
initMetrics();

// Create logger
const logger = createLogger();

// Graceful shutdown
const shutdown = () => {
  sdk.shutdown()
    .then(() => console.log('OTel SDK shut down'))
    .catch((err) => console.error('Error shutting down SDK', err))
    .finally(() => process.exit(0));
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = {
  logger,
  trackRequest,
  loggerProvider,
};
