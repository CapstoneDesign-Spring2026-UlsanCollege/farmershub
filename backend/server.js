require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

/**
 * Entry point — connects to MongoDB then starts the HTTP server.
 * All Express configuration lives in app.js.
 */
const start = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`FarmersHub API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
};

start();
