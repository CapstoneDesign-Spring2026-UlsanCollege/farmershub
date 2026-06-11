const User = require('../models/User');
const { getAdminEmail, getAdminPassword, getAdminName } = require('../config/env');

function isConfiguredAdmin(user = {}) {
  return String(user.email || '').trim().toLowerCase() === getAdminEmail() && user.role === 'admin';
}

async function ensureAdminAccount() {
  const adminEmail = getAdminEmail();
  const adminPassword = getAdminPassword();
  const adminName = getAdminName();

  const existing = await User.findOne({ email: adminEmail }).select('+password');

  if (!existing) {
    return User.create({
      fullName: adminName,
      email: adminEmail,
      password: adminPassword,
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
    existing.fullName = adminName;
    changed = true;
  }

  const passwordMatches = await existing.comparePassword(adminPassword);
  if (!passwordMatches) {
    existing.password = adminPassword;
    changed = true;
  }

  return changed ? existing.save() : existing;
}

module.exports = {
  ensureAdminAccount,
  isConfiguredAdmin,
};
