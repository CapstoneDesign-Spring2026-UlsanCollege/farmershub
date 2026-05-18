const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const { app, startServer } = require('./src/server');
const { resetMemoryStore } = require('./store');

if (require.main === module) {
  startServer();
}

module.exports = { app, resetMemoryStore };
