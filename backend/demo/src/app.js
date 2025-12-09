// Load instrumentation first
require('./instrumentation');

const express = require('express');
const { Pool } = require('pg');
const { trace, metrics, SpanStatusCode } = require('@opentelemetry/api');
const winston = require('winston');

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'backend' },
  transports: [
    new winston.transports.Console(),
  ],
});

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'demo',
  user: process.env.DB_USER || 'demo_app',
  password: process.env.DB_PASSWORD,
});

// OTEL metrics
const meter = metrics.getMeter('backend');
const requestCounter = meter.createCounter('http_requests_total', {
  description: 'Total HTTP requests',
});
const requestDuration = meter.createHistogram('http_request_duration_ms', {
  description: 'HTTP request duration in milliseconds',
});

// Middleware: request logging and metrics
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    requestCounter.add(1, { method: req.method, path: req.path, status: res.statusCode });
    requestDuration.record(duration, { method: req.method, path: req.path });
    logger.info('request', { method: req.method, path: req.path, status: res.statusCode, duration });
  });

  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Hello endpoint with DB time
app.get('/api/hello', async (req, res) => {
  const tracer = trace.getTracer('backend');

  const span = tracer.startSpan('get-server-time');
  try {
    const result = await pool.query('SELECT NOW() as server_time');
    const serverTime = result.rows[0].server_time;

    span.setStatus({ code: SpanStatusCode.OK });
    span.setAttribute('db.server_time', serverTime.toISOString());

    res.json({
      message: 'Hello from demo API',
      serverTime: serverTime,
    });
  } catch (error) {
    span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
    span.recordException(error);
    logger.error('Database error', { error: error.message });

    res.status(500).json({
      error: 'Database connection failed',
      message: error.message,
    });
  } finally {
    span.end();
  }
});

// Start server
app.listen(PORT, () => {
  logger.info('Server started', { port: PORT });
});
