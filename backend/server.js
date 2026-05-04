const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const createAuthRouter = require('./routes/auth');
const createUserRouter = require('./routes/users');
const createProductRouter = require('./routes/products');
const { createStore, resetMemoryStore } = require('./store');

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT || 5000);
const MONGO_URI = process.env.MONGO_URI || '';
const USE_IN_MEMORY_DB = String(process.env.USE_IN_MEMORY_DB || '').toLowerCase() === 'true';
const activeInMemoryMode = USE_IN_MEMORY_DB || !MONGO_URI;

const allowedOrigins = String(process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('CORS: Origin not allowed'));
    }
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

const store = createStore({ useMemory: activeInMemoryMode });

app.get('/api/health', async (req, res) => {
  const mongoConnected = mongoose.connection.readyState === 1;
  return res.json({
    success: true,
    data: {
      status: 'ok',
      inMemoryMode: activeInMemoryMode,
      mongoConnected
    }
  });
});

app.get('/', (req, res) => {
  return res.json({
    success: true,
    message: 'FarmersHub API is running'
  });
});

app.use('/api/auth', createAuthRouter(store));
app.use('/api/users', createUserRouter(store));
app.use('/api/products', createProductRouter(store));

app.use((err, req, res, next) => {
  if (err && err.message && err.message.startsWith('CORS:')) {
    return res.status(403).json({ success: false, message: err.message });
  }

  return res.status(500).json({ success: false, message: 'Unexpected server error.' });
});

async function connectMongoIfNeeded() {
  if (activeInMemoryMode) {
    return;
  }

  await mongoose.connect(MONGO_URI);
}

let serverInstance = null;

async function startServer() {
  try {
    await connectMongoIfNeeded();
    serverInstance = app.listen(PORT, () => {
      const mode = activeInMemoryMode ? 'memory' : 'mongo';
      console.log(`FarmersHub API running on port ${PORT} (${mode} mode)`);
    });
    return serverInstance;
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exitCode = 1;
    throw error;
  }
}

if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  startServer,
  resetMemoryStore,
  closeServer: async () => {
    if (serverInstance) {
      await new Promise((resolve) => {
        serverInstance.close(resolve);
      });
    }

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
};