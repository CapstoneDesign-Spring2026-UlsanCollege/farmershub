import { apiFetch, jsonHeaders } from './config/api.config.js';
import { getAvailableDeliveryPartners } from './services/deliveryPartnerService.js';

function won(value) {
  return `₩${Number(value || 0).toLocaleString()}`;
}
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

let backdrop = null;

function ensure() {
  if (backdrop) return backdrop;
  backdrop = document.createElement('div');
  backdrop.className = 'fh-modal-backdrop';
  backdrop.innerHTML = `
    <div class="fh-modal" role="dialog" aria-modal="true" aria-labelledby="fhDeliveryTitle">
      <h2 class="fh-modal__title" id="fhDeliveryTitle">Choose a delivery partner</h2>
      <p class="fh-modal__subtitle">The flat delivery fee is paid from your wallet to the provider. Selecting a partner ships the order.</p>
      <div data-options></div>
      <p class="fh-modal__status" data-status role="status" aria-live="polite"></p>
      <div class="fh-modal__actions">
        <button type="button" class="fh-btn fh-btn--muted" data-cancel>Cancel</button>
        <button type="button" class="fh-btn fh-btn--primary" data-confirm disabled>Ship order</button>
      </div>
    </div>`;
  document.body.appendChild(backdrop);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  return backdrop;
}

function close() {
  if (backdrop) backdrop.classList.remove('is-open');
}

/**
 * Open the picker for an order. Resolves with the updated order on success,
 * or null if the farmer cancels.
 * @param {string} orderId
 * @returns {Promise<object|null>}
 */
export function openDeliveryPicker(orderId) {
  const el = ensure();
  const optionsEl = el.querySelector('[data-options]');
  const statusEl = el.querySelector('[data-status]');
  const confirmBtn = el.querySelector('[data-confirm]');
  const cancelBtn = el.querySelector('[data-cancel]');
  let selectedId = null;

  statusEl.className = 'fh-modal__status';
  statusEl.textContent = 'Loading delivery partners…';
  optionsEl.innerHTML = '';
  confirmBtn.disabled = true;
  el.classList.add('is-open');

  return new Promise((resolve) => {
    let settled = false;
    const finish = (value) => { if (!settled) { settled = true; close(); resolve(value); } };

    cancelBtn.onclick = () => finish(null);

    getAvailableDeliveryPartners()
      .then((res) => {
        const partners = (res.data || res).partners || [];
        if (!partners.length) {
          statusEl.textContent = 'No delivery partners are available yet. Ask a provider to host one.';
          return;
        }
        statusEl.textContent = '';
        optionsEl.innerHTML = partners.map((p) => `
          <label class="fh-partner-option" data-id="${p.id}">
            <span>
              <span class="fh-partner-option__name">${escapeHtml(p.name)}</span>
              <br><span class="fh-partner-option__meta">${escapeHtml(p.vehicleType)}${p.coverageArea ? ` · ${escapeHtml(p.coverageArea)}` : ''}${p.estimatedTime ? ` · ${escapeHtml(p.estimatedTime)}` : ''} · by ${escapeHtml(p.providerName || 'Provider')}</span>
            </span>
            <span class="fh-partner-option__fee">${won(p.fee)}</span>
          </label>`).join('');

        optionsEl.querySelectorAll('.fh-partner-option').forEach((opt) => {
          opt.addEventListener('click', () => {
            selectedId = opt.dataset.id;
            optionsEl.querySelectorAll('.fh-partner-option').forEach((o) => o.classList.remove('is-selected'));
            opt.classList.add('is-selected');
            confirmBtn.disabled = false;
          });
        });
      })
      .catch((err) => { statusEl.textContent = err.message || 'Could not load delivery partners.'; });

    confirmBtn.onclick = async () => {
      if (!selectedId) return;
      confirmBtn.disabled = true;
      statusEl.className = 'fh-modal__status';
      statusEl.textContent = 'Assigning partner and shipping…';
      try {
        const result = await apiFetch(`/orders/${orderId}/delivery`, {
          method: 'PUT',
          headers: jsonHeaders(),
          body: JSON.stringify({ partnerId: selectedId }),
        });
        window.dispatchEvent(new CustomEvent('fh-wallet-changed'));
        finish((result.data || result).order);
      } catch (err) {
        confirmBtn.disabled = false;
        statusEl.textContent = err.message || 'Could not ship the order.';
        statusEl.classList.add('is-error');
      }
    };
  });
}
