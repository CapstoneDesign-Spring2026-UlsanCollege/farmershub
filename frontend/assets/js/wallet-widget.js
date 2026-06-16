import {
  getWallet,
  createRechargeRequest,
  getMyRechargeRequests,
} from './services/walletService.js';

const MAX_RECHARGE = 500000;
const QUICK_AMOUNTS = [10000, 50000, 100000, 500000];

function won(value) {
  return `₩${Number(value || 0).toLocaleString()}`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function txLabel(tx) {
  const map = {
    recharge: 'Wallet recharge',
    order_payment: tx.direction === 'debit' ? 'Order payment' : 'Order received',
    order_refund: 'Order refund',
    delivery_fee: tx.direction === 'debit' ? 'Delivery fee paid' : 'Delivery earnings',
    adjustment: 'Adjustment',
  };
  return tx.description || map[tx.type] || tx.type;
}

let modalEl = null;

function ensureModal() {
  if (modalEl) return modalEl;
  const backdrop = document.createElement('div');
  backdrop.className = 'fh-modal-backdrop';
  backdrop.innerHTML = `
    <div class="fh-modal" role="dialog" aria-modal="true" aria-labelledby="fhWalletModalTitle">
      <h2 class="fh-modal__title" id="fhWalletModalTitle">Recharge wallet</h2>
      <p class="fh-modal__subtitle">Send a top-up request to the administrator. Maximum ${won(MAX_RECHARGE)} per request.</p>
      <div class="fh-chip-row" data-quick></div>
      <div class="fh-field">
        <label for="fhRechargeAmount">Amount (won)</label>
        <input id="fhRechargeAmount" type="number" min="1" max="${MAX_RECHARGE}" step="1000" placeholder="e.g. 50000" inputmode="numeric" />
      </div>
      <div class="fh-field">
        <label for="fhRechargeNote">Note for admin (optional)</label>
        <textarea id="fhRechargeNote" rows="2" maxlength="300" placeholder="Anything the admin should know"></textarea>
      </div>
      <p class="fh-modal__status" data-status role="status" aria-live="polite"></p>
      <div class="fh-modal__actions">
        <button type="button" class="fh-btn fh-btn--muted" data-cancel>Cancel</button>
        <button type="button" class="fh-btn fh-btn--primary" data-submit>Send request</button>
      </div>
    </div>`;
  document.body.appendChild(backdrop);
  modalEl = backdrop;

  const amountInput = backdrop.querySelector('#fhRechargeAmount');
  const noteInput = backdrop.querySelector('#fhRechargeNote');
  const status = backdrop.querySelector('[data-status]');
  const submitBtn = backdrop.querySelector('[data-submit]');
  const quick = backdrop.querySelector('[data-quick]');

  QUICK_AMOUNTS.forEach((value) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'fh-chip';
    chip.textContent = won(value);
    chip.addEventListener('click', () => { amountInput.value = String(value); });
    quick.appendChild(chip);
  });

  const close = () => backdrop.classList.remove('is-open');
  backdrop.querySelector('[data-cancel]').addEventListener('click', close);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('is-open')) close();
  });

  submitBtn.addEventListener('click', async () => {
    const amount = Math.round(Number(amountInput.value));
    status.className = 'fh-modal__status';
    if (!Number.isFinite(amount) || amount <= 0) {
      status.textContent = 'Enter a valid amount.';
      status.classList.add('is-error');
      return;
    }
    if (amount > MAX_RECHARGE) {
      status.textContent = `Maximum is ${won(MAX_RECHARGE)} per request.`;
      status.classList.add('is-error');
      return;
    }
    submitBtn.disabled = true;
    status.textContent = 'Sending request…';
    try {
      await createRechargeRequest(amount, noteInput.value.trim());
      status.textContent = 'Request sent! The admin will review it shortly.';
      status.classList.add('is-ok');
      amountInput.value = '';
      noteInput.value = '';
      window.dispatchEvent(new CustomEvent('fh-wallet-changed'));
      setTimeout(close, 1200);
    } catch (err) {
      status.textContent = err.message || 'Could not send the request.';
      status.classList.add('is-error');
    } finally {
      submitBtn.disabled = false;
    }
  });

  return backdrop;
}

function openRechargeModal() {
  const backdrop = ensureModal();
  backdrop.querySelector('[data-status]').textContent = '';
  backdrop.classList.add('is-open');
  backdrop.querySelector('#fhRechargeAmount').focus();
}

function renderTransactions(transactions = []) {
  if (!transactions.length) {
    return '<p class="fh-wallet-empty">No transactions yet.</p>';
  }
  const items = transactions.map((tx) => {
    const sign = tx.direction === 'credit' ? '+' : '−';
    const cls = tx.direction === 'credit' ? 'credit' : 'debit';
    const when = tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : '';
    const meta = tx.counterparty && tx.counterparty.name ? ` · ${escapeHtml(tx.counterparty.name)}` : '';
    return `<li class="fh-wallet-tx__item">
      <span><span class="fh-wallet-tx__desc">${escapeHtml(txLabel(tx))}</span><br><span class="fh-wallet-tx__meta">${when}${meta}</span></span>
      <span class="fh-wallet-tx__amt fh-wallet-tx__amt--${cls}">${sign}${won(tx.amount)}</span>
    </li>`;
  }).join('');
  return `<ul class="fh-wallet-tx">${items}</ul>`;
}

let historyModalEl = null;
function openHistoryModal(transactions) {
  if (!historyModalEl) {
    historyModalEl = document.createElement('div');
    historyModalEl.className = 'fh-modal-backdrop';
    historyModalEl.innerHTML = `
      <div class="fh-modal" role="dialog" aria-modal="true">
        <h2 class="fh-modal__title">Wallet activity</h2>
        <p class="fh-modal__subtitle">Your most recent virtual money movements.</p>
        <div data-history></div>
        <div class="fh-modal__actions">
          <button type="button" class="fh-btn fh-btn--muted" data-close>Close</button>
        </div>
      </div>`;
    document.body.appendChild(historyModalEl);
    historyModalEl.querySelector('[data-close]').addEventListener('click', () => historyModalEl.classList.remove('is-open'));
    historyModalEl.addEventListener('click', (e) => { if (e.target === historyModalEl) historyModalEl.classList.remove('is-open'); });
  }
  historyModalEl.querySelector('[data-history]').innerHTML = renderTransactions(transactions);
  historyModalEl.classList.add('is-open');
}

/**
 * Render the "My Balance" card into a mount element and wire the recharge flow.
 * @param {{ mount: string|HTMLElement }} options
 */
export async function initWalletWidget(options = {}) {
  const mount = typeof options.mount === 'string'
    ? document.querySelector(options.mount)
    : options.mount;
  if (!mount) return;

  mount.innerHTML = `
    <div class="fh-wallet-card">
      <p class="fh-wallet-card__label">My Balance</p>
      <p class="fh-wallet-card__balance" data-balance>₩…</p>
      <p class="fh-wallet-card__hint">Virtual wallet</p>
      <div class="fh-wallet-card__actions">
        <button type="button" class="fh-wallet-btn fh-wallet-btn--primary" data-recharge>Recharge</button>
        <button type="button" class="fh-wallet-btn fh-wallet-btn--ghost" data-history-btn>Activity</button>
      </div>
      <div class="fh-wallet-pending" data-pending></div>
    </div>`;

  const balanceEl = mount.querySelector('[data-balance]');
  const pendingEl = mount.querySelector('[data-pending]');
  let lastTransactions = [];

  mount.querySelector('[data-recharge]').addEventListener('click', openRechargeModal);
  mount.querySelector('[data-history-btn]').addEventListener('click', () => openHistoryModal(lastTransactions));

  async function refresh() {
    try {
      const res = await getWallet(20);
      const data = res.data || res;
      balanceEl.textContent = won(data.balance);
      lastTransactions = data.transactions || [];
    } catch (err) {
      balanceEl.textContent = '₩0';
    }
    try {
      const reqRes = await getMyRechargeRequests();
      const requests = (reqRes.data || reqRes).requests || [];
      const pending = requests.filter((r) => r.status === 'pending');
      pendingEl.textContent = pending.length
        ? `${pending.length} recharge request${pending.length > 1 ? 's' : ''} awaiting admin approval`
        : '';
    } catch {
      pendingEl.textContent = '';
    }
  }

  window.addEventListener('fh-wallet-changed', refresh);
  await refresh();
  return { refresh };
}

export { won, openRechargeModal };
