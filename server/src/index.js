const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const categoriesTree = require('./api/categories-tree');
const notes = require('./api/notes');

const requiredEnv = ['ALLOWED_ORIGINS', 'CLIENT_PORT', 'API_PORT'];
const missingEnv = requiredEnv.filter((name) => !process.env[name]);
if (missingEnv.length > 0) {
  // Fail fast with a clear message instead of a cryptic TypeError.
  throw new Error(
    `Missing required environment variables: ${missingEnv.join(', ')}`,
  );
}

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
  .map((origin) => `http://${origin}:${process.env.CLIENT_PORT}`);

const corsOptions = {
  origin: allowedOrigins,
};

app.use(express.json({ limit: '1mb' }));
app.use(cors(corsOptions));
app.use(morgan('dev'));

app.use('/api/categories-tree', categoriesTree);
app.use('/api/notes', notes);

// 404 handler for unmatched routes.
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Centralized error handler returning a consistent JSON shape.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status >= 500) {
    console.error(err.stack || err.message);
  }
  res.status(status).json({ error: err.message || 'Internal server error' });
});

app.listen(process.env.API_PORT);
