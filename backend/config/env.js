const path = require('path');
const dotenv = require('dotenv');

let envLoaded = false;

function loadEnv() {
  if (envLoaded) return;
  dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
  envLoaded = true;
}

function getRequiredEnv(name) {
  loadEnv();
  const value = process.env[name];

  if (!value || !String(value).trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return String(value).trim();
}

function getAdminEmail() {
  return getRequiredEnv('ADMIN_EMAIL').toLowerCase();
}

function getAdminPassword() {
  return getRequiredEnv('ADMIN_PASSWORD');
}

function getAdminName() {
  loadEnv();
  return String(process.env.ADMIN_NAME || 'FarmersHub Administrator').trim() || 'FarmersHub Administrator';
}

loadEnv();

module.exports = {
  loadEnv,
  getRequiredEnv,
  getAdminEmail,
  getAdminPassword,
  getAdminName,
};
