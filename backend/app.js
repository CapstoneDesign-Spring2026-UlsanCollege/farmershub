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
const notificationRoutes = require('./routes/notifications.routes');
const messageRoutes = require('./routes/messages.routes');
const friendRequestRoutes = require('./routes/friendRequests.routes');
const providerRoutes = require('./routes/providers.routes');
const farmServiceListingRoutes = require('./routes/farmServiceListings.routes');
const serviceRequestRoutes = require('./routes/serviceRequests.routes');
const orderRoutes = require('./routes/orders.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// ── Security headers ───────────────────────────────────────────────────────────
const isProduction = process.env.NODE_ENV === 'production';
app.use(
  helmet({
    // Existing frontend pages contain inline scripts; keep strict CSP in production.
    contentSecurityPolicy: isProduction ? undefined : false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// ── CORS ───────────────────────────────────────────────────────────────────────
const localOrigins = [
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:7778',
  'http://127.0.0.1:7778',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];
const configuredOrigins = String(process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set([
  ...configuredOrigins,
  ...(isProduction ? [] : localOrigins),
]);

app.use(
  cors({
    origin: (origin, callback) => {
      // CORS applies to browsers; tools such as curl and server-to-server calls have no origin.
      if (!origin || allowedOrigins.has(origin)) return callback(null, true);
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
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
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    maxAge: isProduction ? '7d' : 0,
    etag: true,
    lastModified: true,
  })
);

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
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/friend-requests', friendRequestRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/farm-service-listings', farmServiceListingRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// ── 404 handler ────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Centralized error handler (must be last) ───────────────────────────────────
app.use(errorHandler);

module.exports = app;
