import {
  getMyDeliveryPartners,
  createDeliveryPartner,
  updateDeliveryPartner,
  deleteDeliveryPartner,
} from './services/deliveryPartnerService.js';

const VEHICLES = ['bike', 'scooter', 'van', 'truck', 'refrigerated', 'other'];

function won(value) {
  return `₩${Number(value || 0).toLocaleString()}`;
}
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

export async function initProviderDelivery(options = {}) {
  const mount = typeof options.mount === 'string' ? document.querySelector(options.mount) : options.mount;
  if (!mount) return;

  mount.innerHTML = `
    <h2>Delivery Partners</h2>
    <p style="margin:0 0 14px;color:#6c7a70;font-size:13.5px;">
      Host delivery options farmers can pick when shipping orders. The flat fee is paid into your wallet.
    </p>
    <form data-form style="display:grid;gap:10px;margin-bottom:16px;">
      <div class="fh-field" style="margin:0;"><label>Partner / courier name</label><input data-name type="text" maxlength="120" placeholder="e.g. GreenWheels Express" required></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        <div class="fh-field" style="margin:0;"><label>Vehicle</label><select data-vehicle>${VEHICLES.map((v) => `<option value="${v}">${v}</option>`).join('')}</select></div>
        <div class="fh-field" style="margin:0;"><label>Delivery fee (won)</label><input data-fee type="number" min="0" step="500" value="0"></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        <div class="fh-field" style="margin:0;"><label>Coverage area</label><input data-area type="text" maxlength="160" placeholder="e.g. Seoul metro"></div>
        <div class="fh-field" style="margin:0;"><label>Estimated time</label><input data-eta type="text" maxlength="80" placeholder="e.g. 1–2 days"></div>
      </div>
      <p data-status class="fh-modal__status"></p>
      <div><button type="submit" class="fh-btn fh-btn--primary" data-submit>Add delivery partner</button>
      <button type="button" class="fh-btn fh-btn--muted" data-reset style="display:none;">Cancel edit</button></div>
    </form>
    <div data-list aria-live="polite"></div>`;

  const form = mount.querySelector('[data-form]');
  const nameEl = mount.querySelector('[data-name]');
  const vehicleEl = mount.querySelector('[data-vehicle]');
  const feeEl = mount.querySelector('[data-fee]');
  const areaEl = mount.querySelector('[data-area]');
  const etaEl = mount.querySelector('[data-eta]');
  const statusEl = mount.querySelector('[data-status]');
  const submitEl = mount.querySelector('[data-submit]');
  const resetEl = mount.querySelector('[data-reset]');
  const listEl = mount.querySelector('[data-list]');
  let editingId = null;

  function payload() {
    return {
      name: nameEl.value.trim(),
      vehicleType: vehicleEl.value,
      fee: Math.max(Math.round(Number(feeEl.value) || 0), 0),
      coverageArea: areaEl.value.trim(),
      estimatedTime: etaEl.value.trim(),
    };
  }

  function resetForm() {
    editingId = null;
    form.reset();
    feeEl.value = '0';
    submitEl.textContent = 'Add delivery partner';
    resetEl.style.display = 'none';
  }

  function startEdit(p) {
    editingId = p.id;
    nameEl.value = p.name;
    vehicleEl.value = p.vehicleType;
    feeEl.value = p.fee;
    areaEl.value = p.coverageArea || '';
    etaEl.value = p.estimatedTime || '';
    submitEl.textContent = 'Save changes';
    resetEl.style.display = '';
    nameEl.focus();
  }

  async function refresh() {
    try {
      const res = await getMyDeliveryPartners();
      const partners = (res.data || res).partners || [];
      if (!partners.length) {
        listEl.innerHTML = '<p class="fh-wallet-empty">No delivery partners yet. Add one above.</p>';
        return;
      }
      listEl.innerHTML = partners.map((p) => `
        <div class="fh-partner-option" style="cursor:default;">
          <span>
            <span class="fh-partner-option__name">${escapeHtml(p.name)}</span>
            ${p.isActive ? '' : ' <em style="color:#c2410c;font-size:12px;">(inactive)</em>'}
            <br><span class="fh-partner-option__meta">${escapeHtml(p.vehicleType)}${p.coverageArea ? ` · ${escapeHtml(p.coverageArea)}` : ''}${p.estimatedTime ? ` · ${escapeHtml(p.estimatedTime)}` : ''}</span>
          </span>
          <span style="display:flex;align-items:center;gap:10px;">
            <span class="fh-partner-option__fee">${won(p.fee)}</span>
            <button type="button" class="fh-wallet-btn fh-wallet-btn--ghost" style="background:#eef1ee;color:#41524a;box-shadow:none;padding:6px 10px;" data-edit="${p.id}">Edit</button>
            <button type="button" class="fh-wallet-btn" style="background:#fdecec;color:#c2410c;padding:6px 10px;" data-del="${p.id}">Delete</button>
          </span>
        </div>`).join('');

      listEl.querySelectorAll('[data-edit]').forEach((btn) => btn.addEventListener('click', () => {
        const p = partners.find((x) => x.id === btn.dataset.edit);
        if (p) startEdit(p);
      }));
      listEl.querySelectorAll('[data-del]').forEach((btn) => btn.addEventListener('click', async () => {
        if (!window.confirm('Remove this delivery partner?')) return;
        await deleteDeliveryPartner(btn.dataset.del).catch(() => {});
        if (editingId === btn.dataset.del) resetForm();
        refresh();
      }));
    } catch (err) {
      listEl.innerHTML = `<p class="fh-wallet-empty">Could not load delivery partners.</p>`;
    }
  }

  resetEl.addEventListener('click', resetForm);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = payload();
    statusEl.className = 'fh-modal__status';
    if (!data.name) {
      statusEl.textContent = 'Name is required.';
      statusEl.classList.add('is-error');
      return;
    }
    submitEl.disabled = true;
    try {
      if (editingId) {
        await updateDeliveryPartner(editingId, data);
      } else {
        await createDeliveryPartner(data);
      }
      statusEl.textContent = 'Saved.';
      statusEl.classList.add('is-ok');
      resetForm();
      refresh();
    } catch (err) {
      statusEl.textContent = err.message || 'Could not save.';
      statusEl.classList.add('is-error');
    } finally {
      submitEl.disabled = false;
    }
  });

  await refresh();
}
