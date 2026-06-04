import { useState } from 'react';
import { createFarmServiceListing, updateFarmServiceListing } from '../../../api/farmServiceListingsApi.js';
import { StatusMessage } from '../../../components/common/States.jsx';
import { getId, humanize } from '../../../utils/format.js';

const LISTING_CATEGORIES = [
  'tractor',
  'tiller',
  'irrigation_pump',
  'delivery_truck',
  'fertilizer',
  'cold_storage',
  'soil_testing',
  'specialist_services',
];

const LISTING_TYPES = ['rental', 'service', 'transport', 'storage', 'input_supply', 'consultation', 'repair'];
const PRICING_TYPES = ['quote_required', 'fixed', 'per_hour', 'per_day', 'per_acre', 'per_delivery', 'per_unit'];

export function ListingForm({ listing = {}, onSaved }) {
  const [status, setStatus] = useState({ message: '', tone: 'info' });

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      title: formData.get('title'),
      category: formData.get('category'),
      listingType: formData.get('listingType'),
      pricingType: formData.get('pricingType'),
      price: formData.get('price'),
      unitLabel: formData.get('unitLabel'),
      serviceArea: formData.get('serviceArea'),
      availability: formData.get('availability'),
      description: formData.get('description'),
      equipmentDetails: formData.get('equipmentDetails'),
      termsSummary: formData.get('termsSummary'),
    };
    try {
      if (getId(listing)) {
        await updateFarmServiceListing(getId(listing), payload);
      } else {
        await createFarmServiceListing(payload);
      }
      setStatus({ message: 'Listing saved through the Farm Service Listings API.', tone: 'success' });
      onSaved?.();
    } catch (saveError) {
      setStatus({ message: saveError.message || 'Unable to save listing.', tone: 'error' });
    }
  }

  return (
    <form className="info-card compact-form" onSubmit={handleSubmit}>
      <h2>{getId(listing) ? 'Edit listing' : 'Create listing'}</h2>
      <label>Title<input name="title" defaultValue={listing.title || ''} required /></label>
      <label>Category<select name="category" defaultValue={listing.category || 'tractor'}>{LISTING_CATEGORIES.map((item) => <option key={item} value={item}>{humanize(item)}</option>)}</select></label>
      <label>Listing type<select name="listingType" defaultValue={listing.listingType || 'service'}>{LISTING_TYPES.map((item) => <option key={item} value={item}>{humanize(item)}</option>)}</select></label>
      <label>Pricing<select name="pricingType" defaultValue={listing.pricingType || 'quote_required'}>{PRICING_TYPES.map((item) => <option key={item} value={item}>{humanize(item)}</option>)}</select></label>
      <label>Price<input type="number" min="0" step="1" name="price" defaultValue={listing.price || 0} /></label>
      <label>Unit label<input name="unitLabel" defaultValue={listing.unitLabel || ''} /></label>
      <label>Service area<input name="serviceArea" defaultValue={listing.serviceArea || listing.provider?.serviceArea || ''} required /></label>
      <label>Availability<input name="availability" defaultValue={listing.availability || ''} /></label>
      <label className="wide-field">Description<textarea name="description" rows="4" defaultValue={listing.description || ''} required /></label>
      <label className="wide-field">Equipment details<textarea name="equipmentDetails" rows="3" defaultValue={listing.equipmentDetails || ''} /></label>
      <label className="wide-field">Terms summary<textarea name="termsSummary" rows="3" defaultValue={listing.termsSummary || ''} /></label>
      <button className="primary-button" type="submit">Save listing</button>
      <StatusMessage message={status.message} tone={status.tone} />
    </form>
  );
}
