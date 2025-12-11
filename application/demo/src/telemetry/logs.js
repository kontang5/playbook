const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');
const { LoggerProvider, SimpleLogRecordProcessor } = require('@opentelemetry/sdk-logs');
const { SeverityNumber } = require('@opentelemetry/api-logs');
const winston = require('winston');

const OTEL_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://otel-collector:4318';

// Log exporter
const logExporter = new OTLPLogExporter({
  url: `${OTEL_ENDPOINT}/v1/logs`,
});

// Create logger provider (resource set in index.js)
let loggerProvider = null;
let otelLogger = null;

const initLoggerProvider = (resource) => {
  // SDK 2.x: processors passed in constructor, not via addLogRecordProcessor()
  loggerProvider = new LoggerProvider({
    resource,
    processors: [new SimpleLogRecordProcessor(logExporter)],
  });
  otelLogger = loggerProvider.getLogger('backend');
  return loggerProvider;
};

// Winston transport that sends logs to OTel
class OTelTransport extends winston.Transport {
  log(info, callback) {
    if (!otelLogger) {
      callback();
      return;
    }

    const severityMap = {
      error: SeverityNumber.ERROR,
      warn: SeverityNumber.WARN,
      info: SeverityNumber.INFO,
      debug: SeverityNumber.DEBUG,
    };

    const { level, message, timestamp, ...attributes } = info;

    otelLogger.emit({
      severityNumber: severityMap[level] || SeverityNumber.INFO,
      severityText: level.toUpperCase(),
      body: message,
      attributes,
    });

    callback();
  }
}

// Create Winston logger with OTel transport
const createLogger = () => {
  return winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    defaultMeta: { service: 'backend' },
    transports: [
      new winston.transports.Console(),
      new OTelTransport(),
    ],
  });
};

module.exports = {
  logExporter,
  initLoggerProvider,
  createLogger,
};
