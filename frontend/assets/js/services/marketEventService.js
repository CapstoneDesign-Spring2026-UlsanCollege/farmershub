import { apiFetch } from '../config/api.config.js';

function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, value);
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

async function getUpcomingMarketEvents(params = {}) {
  return apiFetch(`/market-events${buildQuery(params)}`);
}

export { getUpcomingMarketEvents };
