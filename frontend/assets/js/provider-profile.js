import { getProviderProfile, updateProviderProfile } from './services/providerService.js';
import { getFarmServiceListings } from './services/farmServiceListingService.js';
import { requireProvider, appendField, clearElement, createStateCard, setStatus, humanize } from './provider-shell.js';

function fillForm(profile = {}) {
  const form = document.getElementById('providerProfileForm');
  ['businessName', 'businessType', 'serviceArea', 'location', 'publicEmail', 'publicPhone', 'website', 'operatingHours', 'bio'].forEach((name) => {
    if (form.elements[name]) form.elements[name].value = profile[name] || '';
  });
  if (form.elements.contactPreference) form.elements.contactPreference.value = profile.contactPreference || 'message';
  if (form.elements.serviceCategories) {
    form.elements.serviceCategories.value = (profile.serviceCategories || []).join(', ');
  }
}

function renderPreview(profile) {
  const preview = document.getElementById('providerProfilePreview');
  clearElement(preview);
  appendField(preview, 'Business', profile.businessName);
  appendField(preview, 'Service area', profile.serviceArea);
  appendField(preview, 'Categories', (profile.serviceCategories || []).map(humanize).join(', '));
  appendField(preview, 'Verification', profile.verificationStatus === 'approved' ? 'Approved' : 'Verification is pending platform review.');
  appendField(preview, 'Contact', profile.contactPreference);
}

function payloadFrom(form) {
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
    contactPreference: String(data.get('contactPreference') || 'message'),
    serviceCategories: String(data.get('serviceCategories') || '').split(',').map((item) => item.trim()).filter(Boolean),
  };
}

async function initialise() {
  await requireProvider();
  const form = document.getElementById('providerProfileForm');
  try {
    const profileResponse = await getProviderProfile();
    const profile = profileResponse.data || {};
    fillForm(profile);
    renderPreview(profile);
    const listings = await getFarmServiceListings({ mine: 'true', status: 'active', limit: 20 });
    const active = listings.data?.listings || [];
    const list = document.getElementById('providerProfileListings');
    clearElement(list);
    if (!active.length) {
      list.appendChild(createStateCard('No active public listings', 'Publish a listing to show it on your public provider profile.'));
    } else {
      active.forEach((listing) => {
        const card = document.createElement('article');
        card.className = 'provider-card';
        const title = document.createElement('h3');
        title.textContent = listing.title;
        const copy = document.createElement('p');
        copy.textContent = `${humanize(listing.category)} - ${listing.serviceArea}`;
        card.append(title, copy);
        list.appendChild(card);
      });
    }
  } catch (error) {
    setStatus('providerProfileStatus', error.message || 'Unable to load profile.', 'error');
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const response = await updateProviderProfile(payloadFrom(form));
      renderPreview(response.data || {});
      setStatus('providerProfileStatus', 'Profile saved.');
    } catch (error) {
      setStatus('providerProfileStatus', error.message || 'Unable to save profile.', 'error');
    }
  });
}

document.addEventListener('DOMContentLoaded', initialise);
