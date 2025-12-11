// Load telemetry first
const { logger, trackRequest } = require('./telemetry/index');

const express = require('express');
const { Pool } = require('pg');
const { trace, metrics, SpanStatusCode } = require('@opentelemetry/api');

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

// OTEL metrics - counter only (avg duration via observable gauge in metrics.js)
const meter = metrics.getMeter('backend');
const requestCounter = meter.createCounter('http.server.request.total', {
  description: 'Total HTTP server requests',
});

// Middleware: request logging and metrics
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const durationSec = durationMs / 1000;
    const attrs = {
      'http.request.method': req.method,
      'http.response.status_code': res.statusCode,
      'url.path': req.path,
    };
    requestCounter.add(1, attrs);
    trackRequest(durationSec);
    logger.info('request', {
      'http.request.method': req.method,
      'url.path': req.path,
      'http.response.status_code': res.statusCode,
      'http.request.duration': durationMs,
    });
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
