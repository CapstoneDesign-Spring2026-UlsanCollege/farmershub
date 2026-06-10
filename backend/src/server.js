const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const connectDB = require('../config/db');
const app = require('../app');
const { ensureAdminAccount } = require('../services/adminAccountService');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    await ensureAdminAccount();
    app.listen(PORT, () => {
      console.log(`FarmersHub API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

module.exports = { app, startServer };

if (require.main === module) {
  startServer();
}
