import { API_BASE, fetchWithTimeout, getToken } from './config/api.config.js';
import { playNotificationSound } from './notification-sounds.js';

const POLL_INTERVAL_MS = 30000;
const DISMISSED_KEY = 'fh_alert_float_dismissed_signature';
const READ_SYNC_KEY = 'fh_alerts_read_sync';
const FLOAT_ID = 'floatingAlertTab';

let pollTimer = null;
let latestSignature = '';
let lastCheckedSignature = '';
let hasCheckedAlerts = false;

function isAlertsPage() {
  return window.location.pathname.toLowerCase().endsWith('/notifications.html');
}

function injectStyles() {
  if (document.getElementById('floatingAlertTabStyles')) return;

  const style = document.createElement('style');
  style.id = 'floatingAlertTabStyles';
  style.textContent = `
    .floating-alert-tab {
      position: fixed;
      right: 18px;
      bottom: 18px;
      z-index: 1000;
      display: flex;
      align-items: stretch;
      max-width: min(360px, calc(100vw - 28px));
      border: 1px solid rgba(47, 133, 56, 0.24);
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.96);
      box-shadow: 0 18px 44px rgba(31, 90, 40, 0.22);
      overflow: hidden;
      animation: floatingAlertIn 220ms ease both;
      font-family: 'Manrope', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    .floating-alert-tab__open,
    .floating-alert-tab__close {
      border: 0;
      font: inherit;
      cursor: pointer;
    }

    .floating-alert-tab__open {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 10px;
      align-items: center;
      min-width: 0;
      padding: 12px 14px;
      color: #1a2f1d;
      background: transparent;
      text-align: left;
    }

    .floating-alert-tab__badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 34px;
      height: 34px;
      border-radius: 999px;
      color: #fff;
      background: linear-gradient(145deg, #44a94e, #2f8538);
      font-weight: 800;
      box-shadow: 0 8px 16px rgba(47, 133, 56, 0.24);
    }

    .floating-alert-tab__copy {
      min-width: 0;
    }

    .floating-alert-tab__title,
    .floating-alert-tab__body {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .floating-alert-tab__title {
      font-size: 14px;
      font-weight: 800;
      color: #1f5a28;
    }

    .floating-alert-tab__body {
      margin-top: 2px;
      max-width: 250px;
      font-size: 12px;
      font-weight: 700;
      color: #53755a;
    }

    .floating-alert-tab__close {
      width: 42px;
      flex: 0 0 42px;
      color: #53755a;
      background: rgba(238, 248, 232, 0.9);
      font-size: 22px;
      line-height: 1;
    }

    .floating-alert-tab__open:hover,
    .floating-alert-tab__close:hover {
      background: #f6fcf2;
    }

    @keyframes floatingAlertIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 560px) {
      .floating-alert-tab {
        right: 10px;
        bottom: 10px;
        max-width: calc(100vw - 20px);
      }

      .floating-alert-tab__body {
        max-width: 190px;
      }
    }
  `;
  document.head.appendChild(style);
}

async function fetchUnreadNotifications() {
  const token = getToken();
  if (!token) return [];

  try {
    const response = await fetchWithTimeout(`${API_BASE}/notifications?limit=10`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) return [];

    const result = await response.json();
    const notifications = result?.data?.notifications || [];
    return notifications.filter((notification) => !notification.read);
  } catch (error) {
    console.warn('Unable to check alerts:', error);
    return [];
  }
}

function getSignature(unreadNotifications) {
  return unreadNotifications
    .map((notification) => notification._id || notification.id)
    .filter(Boolean)
    .join('|');
}

function removeFloatingTab() {
  document.getElementById(FLOAT_ID)?.remove();
}

function dismissCurrentBatch() {
  if (latestSignature) {
    localStorage.setItem(DISMISSED_KEY, latestSignature);
  }
  removeFloatingTab();
}

function openAlertsPage() {
  const isNestedLoginPage = window.location.pathname.toLowerCase().includes('/login/');
  dismissCurrentBatch();
  window.location.href = isNestedLoginPage ? '../notifications.html' : 'notifications.html';
}

function renderFloatingTab(unreadNotifications) {
  const unreadCount = unreadNotifications.length;
  const latest = unreadNotifications[0];

  latestSignature = getSignature(unreadNotifications);
  if (!unreadCount || localStorage.getItem(DISMISSED_KEY) === latestSignature) {
    removeFloatingTab();
    return;
  }

  injectStyles();

  let tab = document.getElementById(FLOAT_ID);
  if (!tab) {
    tab = document.createElement('aside');
    tab.id = FLOAT_ID;
    tab.className = 'floating-alert-tab';
    tab.setAttribute('aria-live', 'polite');
    tab.innerHTML = `
      <button type="button" class="floating-alert-tab__open">
        <span class="floating-alert-tab__badge"></span>
        <span class="floating-alert-tab__copy">
          <span class="floating-alert-tab__title"></span>
          <span class="floating-alert-tab__body"></span>
        </span>
      </button>
      <button type="button" class="floating-alert-tab__close" aria-label="Dismiss alert tab">x</button>
    `;

    tab.querySelector('.floating-alert-tab__open').addEventListener('click', openAlertsPage);
    tab.querySelector('.floating-alert-tab__close').addEventListener('click', (event) => {
      event.stopPropagation();
      dismissCurrentBatch();
    });
    document.body.appendChild(tab);
  }

  tab.querySelector('.floating-alert-tab__badge').textContent = unreadCount > 9 ? '9+' : String(unreadCount);
  tab.querySelector('.floating-alert-tab__title').textContent =
    unreadCount === 1 ? 'New alert' : `${unreadCount} new alerts`;
  tab.querySelector('.floating-alert-tab__body').textContent = latest?.title || 'Open alerts';
}

async function refreshFloatingTab() {
  const unreadNotifications = await fetchUnreadNotifications();
  const unreadSignature = getSignature(unreadNotifications);
  const shouldPlaySound = hasCheckedAlerts
    && unreadSignature
    && unreadSignature !== lastCheckedSignature
    && localStorage.getItem(DISMISSED_KEY) !== unreadSignature;

  renderFloatingTab(unreadNotifications);
  if (shouldPlaySound) {
    playNotificationSound();
  }
  lastCheckedSignature = unreadSignature;
  hasCheckedAlerts = true;
}

function initFloatingAlertTab() {
  if (isAlertsPage() || pollTimer) return;

  refreshFloatingTab();
  pollTimer = window.setInterval(refreshFloatingTab, POLL_INTERVAL_MS);
  window.addEventListener('focus', refreshFloatingTab);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      refreshFloatingTab();
    }
  });
  window.addEventListener('storage', (event) => {
    if (event.key === READ_SYNC_KEY) {
      refreshFloatingTab();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFloatingAlertTab, { once: true });
} else {
  initFloatingAlertTab();
}
