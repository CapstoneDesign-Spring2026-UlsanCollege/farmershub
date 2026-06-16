import { apiFetch, jsonHeaders, authHeader } from '../config/api.config.js';

// Wallet balance + recent ledger entries for the signed-in user.
async function getWallet(limit = 20) {
  return apiFetch(`/wallet?limit=${encodeURIComponent(limit)}`, { headers: authHeader() });
}

// Ask the administrator to top up the wallet (amount in won, max 500,000).
async function createRechargeRequest(amount, note = '') {
  return apiFetch('/wallet/recharge-requests', {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ amount, note }),
  });
}

// The signed-in user's own recharge requests.
async function getMyRechargeRequests() {
  return apiFetch('/wallet/recharge-requests', { headers: authHeader() });
}

// ── Admin ────────────────────────────────────────────────────────────────────
async function listRechargeRequests(status = '') {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  return apiFetch(`/admin/recharge-requests${qs}`, { headers: authHeader() });
}

async function reviewRechargeRequest(id, action, note = '') {
  return apiFetch(`/admin/recharge-requests/${id}`, {
    method: 'PATCH',
    headers: jsonHeaders(),
    body: JSON.stringify({ action, note }),
  });
}

export {
  getWallet,
  createRechargeRequest,
  getMyRechargeRequests,
  listRechargeRequests,
  reviewRechargeRequest,
};
