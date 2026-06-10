const User = require('../models/User');

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'sonam@gmail.com').trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sonam123!';
const ADMIN_NAME = process.env.ADMIN_NAME || 'FarmersHub Administrator';

function isConfiguredAdmin(user = {}) {
  return String(user.email || '').trim().toLowerCase() === ADMIN_EMAIL && user.role === 'admin';
}

async function ensureAdminAccount() {
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
