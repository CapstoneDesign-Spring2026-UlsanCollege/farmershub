import { getProviderProfile } from './services/providerService.js';
import { requireProvider, appendField, setStatus } from './provider-shell.js';

async function initialise() {
  const user = await requireProvider();
  const panel = document.getElementById('providerSettingsPanel');
  appendField(panel, 'Account name', user.fullName || '');
  appendField(panel, 'Account email', user.email || '');
  appendField(panel, 'Role', user.role || '');
  try {
    const response = await getProviderProfile();
    const profile = response.data || {};
    appendField(panel, 'Business profile', profile.isOnboarded ? 'Complete' : 'Onboarding required');
    appendField(panel, 'Payment support', 'Coming soon. Payment support is not connected yet.');
    appendField(panel, 'Verification', 'Verification is pending platform review.');
  } catch (error) {
    setStatus('providerSettingsStatus', error.message || 'Unable to load settings.', 'error');
  }
}

document.addEventListener('DOMContentLoaded', initialise);
