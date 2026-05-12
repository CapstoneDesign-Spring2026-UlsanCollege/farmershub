const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const { app, startServer } = require('./src/server');

if (require.main === module) {
  startServer();
}

module.exports = { app };
