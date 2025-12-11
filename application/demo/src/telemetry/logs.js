const {OTLPLogExporter} = require('@opentelemetry/exporter-logs-otlp-http');
const {LoggerProvider, SimpleLogRecordProcessor} = require('@opentelemetry/sdk-logs');
const {SeverityNumber} = require('@opentelemetry/api-logs');
const winston = require('winston');

const {OTEL_ENDPOINT} = require('./config');

const SEVERITY_MAP = {
    error: SeverityNumber.ERROR,
    warn: SeverityNumber.WARN,
    info: SeverityNumber.INFO,
    debug: SeverityNumber.DEBUG,
};

let loggerProvider, otelLogger;

// Initialize logger provider
const initLoggerProvider = (resource) => {
    const exporter = new OTLPLogExporter({
        url: `${OTEL_ENDPOINT}/v1/logs`,
    });

    loggerProvider = new LoggerProvider({
        resource,
        processors: [new SimpleLogRecordProcessor(exporter)],
    });

    otelLogger = loggerProvider.getLogger('backend');
    return loggerProvider;
};

// Winston transport that forwards logs to OTel
class OTelTransport extends winston.Transport {
    log(info, callback) {
        if (!otelLogger) {
            return callback();
        }
        const {level, message, timestamp, ...attributes} = info;

        otelLogger.emit({
            severityNumber: SEVERITY_MAP[level] || SeverityNumber.INFO,
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
        defaultMeta: {service: 'backend'},
        transports: [
            new winston.transports.Console(),
            new OTelTransport(),
        ],
    });
};

module.exports = {initLoggerProvider, createLogger};
