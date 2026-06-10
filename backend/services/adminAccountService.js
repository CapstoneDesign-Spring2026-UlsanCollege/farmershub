const User = require('../models/User');

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const ADMIN_NAME = process.env.ADMIN_NAME || 'FarmersHub Administrator';

function isConfiguredAdmin(user = {}) {
  return Boolean(ADMIN_EMAIL) &&
    String(user.email || '').trim().toLowerCase() === ADMIN_EMAIL &&
    user.role === 'admin';
}

async function ensureAdminAccount() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    return null;
  }

  const existing = await User.findOne({ email: ADMIN_EMAIL }).select('+password');

  if (!existing) {
    return User.create({
      fullName: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
      phone: '',
      address: 'FarmersHub Admin',
      isActive: true,
      isVerified: true,
    });
  }

  let changed = false;
  if (existing.role !== 'admin') {
    existing.role = 'admin';
    changed = true;
  }
  if (!existing.isActive) {
    existing.isActive = true;
    changed = true;
  }
  if (!existing.fullName) {
    existing.fullName = ADMIN_NAME;
    changed = true;
  }

  const passwordMatches = await existing.comparePassword(ADMIN_PASSWORD);
  if (!passwordMatches) {
    existing.password = ADMIN_PASSWORD;
    changed = true;
  }

  return changed ? existing.save() : existing;
}

module.exports = {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  ensureAdminAccount,
  isConfiguredAdmin,
};
