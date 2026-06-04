import { getProviderProfile, updateProviderProfile } from './services/providerService.js';
import { requireProvider, setStatus } from './provider-shell.js';

function fillForm(profile = {}) {
  const form = document.getElementById('providerOnboardingForm');
  if (!form) return;
  ['businessName', 'businessType', 'serviceArea', 'location', 'publicEmail', 'publicPhone', 'website', 'operatingHours', 'bio'].forEach((name) => {
    if (form.elements[name]) form.elements[name].value = profile[name] || '';
  });
  if (form.elements.contactPreference) form.elements.contactPreference.value = profile.contactPreference || 'message';
  const categories = Array.isArray(profile.serviceCategories) ? profile.serviceCategories : [];
  form.querySelectorAll('[name="serviceCategories"]').forEach((input) => {
    input.checked = categories.includes(input.value);
  });
}

function collectProfile(form) {
  const data = new FormData(form);
  return {
    businessName: String(data.get('businessName') || '').trim(),
    businessType: String(data.get('businessType') || '').trim(),
    serviceArea: String(data.get('serviceArea') || '').trim(),
    location: String(data.get('location') || '').trim(),
    publicEmail: String(data.get('publicEmail') || '').trim(),
    publicPhone: String(data.get('publicPhone') || '').trim(),
    website: String(data.get('website') || '').trim(),
    operatingHours: String(data.get('operatingHours') || '').trim(),
    bio: String(data.get('bio') || '').trim(),
    contactPreference: String(data.get('contactPreference') || 'message').trim(),
    serviceCategories: data.getAll('serviceCategories'),
  };
}

async function initialise() {
  await requireProvider();
  const status = document.getElementById('providerOnboardingStatus');
  try {
    const response = await getProviderProfile();
    fillForm(response.data || {});
  } catch (error) {
    setStatus(status, error.message || 'Unable to load provider profile.', 'error');
  }

  document.getElementById('providerOnboardingForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = event.currentTarget.querySelector('button[type="submit"]');
    submit.disabled = true;
    setStatus(status, 'Saving provider profile...');
    try {
      const payload = collectProfile(event.currentTarget);
      if (!payload.businessName || !payload.serviceArea) {
        throw new Error('Business name and service area are required.');
      }
      await updateProviderProfile(payload);
      setStatus(status, 'Provider profile saved.');
      window.location.href = 'provider-dashboard.html';
    } catch (error) {
      setStatus(status, error.message || 'Unable to save provider profile.', 'error');
    } finally {
      submit.disabled = false;
    }
  });
}

document.addEventListener('DOMContentLoaded', initialise);
