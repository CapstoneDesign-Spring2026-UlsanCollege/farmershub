const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const errorHandler = require('./middleware/errorHandler');

// ── Route modules ──────────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');
const farmerRoutes = require('./routes/farmers.routes');
const productRoutes = require('./routes/products.routes');
const postRoutes = require('./routes/posts.routes');

const app = express();

// ── Security headers ───────────────────────────────────────────────────────────
const isProduction = process.env.NODE_ENV === 'production';
app.use(
  helmet({
    // Existing frontend pages contain inline scripts; keep strict CSP in production.
    contentSecurityPolicy: isProduction ? undefined : false,
  })
);

// ── CORS ───────────────────────────────────────────────────────────────────────
const allowedOrigins = (
  process.env.CLIENT_ORIGIN ||
  'http://localhost:5000,http://127.0.0.1:5000,http://localhost:5500,http://127.0.0.1:5500,http://localhost:7778,http://127.0.0.1:7778,http://localhost:3000,http://127.0.0.1:3000'
)
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// ── Global rate limiter ────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests — please try again later' },
});
app.use('/api', limiter);

// Stricter limiter on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts — please try again in 15 minutes' },
});

// ── Body parsers ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// ── HTTP request logger (dev only) ────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ── Serve uploaded files statically ───────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Serve frontend locally from the backend in development ───────────────────
const frontendDir = path.resolve(__dirname, '..', 'frontend');
if (process.env.NODE_ENV !== 'production' && fs.existsSync(frontendDir)) {
  app.use(express.static(frontendDir));
}

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'FarmersHub API is healthy', env: process.env.NODE_ENV });
});

// ── API routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/posts', postRoutes);

// ── 404 handler ────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Centralized error handler (must be last) ───────────────────────────────────
app.use(errorHandler);

module.exports = app;
