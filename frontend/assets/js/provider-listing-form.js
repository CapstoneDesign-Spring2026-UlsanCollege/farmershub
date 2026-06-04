import { getFarmServiceListingById, createFarmServiceListing, updateFarmServiceListing } from './services/farmServiceListingService.js';
import { requireProvider, getQueryParam, setStatus } from './provider-shell.js';

const CATEGORIES = [
  ['tractor', 'Tractor'],
  ['tiller', 'Tiller'],
  ['harvester', 'Harvester'],
  ['seeder', 'Seeder'],
  ['sprayer', 'Sprayer'],
  ['irrigation_pump', 'Irrigation Pump'],
  ['drip_irrigation_setup', 'Drip Irrigation Setup'],
  ['water_tank_delivery', 'Water Tank Delivery'],
  ['irrigation_repair', 'Irrigation Repair'],
  ['delivery_truck', 'Delivery Truck'],
  ['produce_pickup', 'Produce Pickup'],
  ['market_transport', 'Market Transport'],
  ['refrigerated_delivery', 'Refrigerated Delivery'],
  ['cold_storage', 'Cold Storage'],
  ['temporary_warehouse_space', 'Temporary Warehouse Space'],
  ['packaging_support', 'Packaging Support'],
  ['sorting_grading', 'Sorting and Grading'],
  ['fertilizer_supply', 'Fertilizer Supply'],
  ['compost_supply', 'Compost Supply'],
  ['seeds', 'Seeds'],
  ['mulch', 'Mulch'],
  ['soil_amendments', 'Soil Amendments'],
  ['soil_testing', 'Soil Testing'],
  ['pest_inspection', 'Pest Inspection'],
  ['equipment_repair', 'Equipment Repair'],
  ['crop_consultation', 'Crop Consultation'],
  ['greenhouse_installation', 'Greenhouse Installation'],
];

function addOptions(select, options) {
  options.forEach(([value, label]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    select.appendChild(option);
  });
}

function fillForm(listing = {}) {
  const form = document.getElementById('providerListingForm');
  ['title', 'price', 'unitLabel', 'serviceArea', 'availability', 'description', 'equipmentDetails', 'termsSummary'].forEach((name) => {
    if (form.elements[name]) form.elements[name].value = listing[name] || '';
  });
  if (form.elements.category) form.elements.category.value = listing.category || 'tractor';
  if (form.elements.listingType) form.elements.listingType.value = listing.listingType || 'rental';
  if (form.elements.pricingType) form.elements.pricingType.value = listing.pricingType || 'quote_required';
  if (form.elements.isActive) form.elements.isActive.checked = listing.isActive !== false;
}

function payloadFrom(form) {
  const data = new FormData(form);
  return {
    title: String(data.get('title') || '').trim(),
    category: String(data.get('category') || '').trim(),
    listingType: String(data.get('listingType') || '').trim(),
    pricingType: String(data.get('pricingType') || '').trim(),
    price: Number(data.get('price') || 0),
    unitLabel: String(data.get('unitLabel') || '').trim(),
    serviceArea: String(data.get('serviceArea') || '').trim(),
    availability: String(data.get('availability') || '').trim(),
    description: String(data.get('description') || '').trim(),
    equipmentDetails: String(data.get('equipmentDetails') || '').trim(),
    termsSummary: String(data.get('termsSummary') || '').trim(),
    isActive: data.get('isActive') === 'on',
  };
}

async function initialise() {
  await requireProvider();
  const form = document.getElementById('providerListingForm');
  addOptions(form.elements.category, CATEGORIES);
  const id = getQueryParam('id');
  if (id) {
    document.getElementById('providerListingFormTitle').textContent = 'Edit service listing';
    try {
      const response = await getFarmServiceListingById(id);
      fillForm(response.data || {});
    } catch (error) {
      setStatus('providerListingFormStatus', error.message || 'Unable to load listing.', 'error');
    }
  } else {
    fillForm();
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    setStatus('providerListingFormStatus', 'Saving listing...');
    try {
      const payload = payloadFrom(form);
      if (!payload.title || !payload.serviceArea || !payload.description) {
        throw new Error('Title, service area, and description are required.');
      }
      if (id) await updateFarmServiceListing(id, payload);
      else await createFarmServiceListing(payload);
      window.location.href = 'provider-listings.html';
    } catch (error) {
      setStatus('providerListingFormStatus', error.message || 'Unable to save listing.', 'error');
    } finally {
      submit.disabled = false;
    }
  });
}

document.addEventListener('DOMContentLoaded', initialise);
