/**
 * Settings Panel Manager
 * Handles opening/closing of the settings panel, saving preferences,
 * and applying visual changes (dark mode, compact cards, etc.)
 */

(function initSettings() {
  const navSettingsBtn = document.getElementById('navSettingsBtn');
  const settingsPanel = document.getElementById('settingsPanel');
  const settingsBackdrop = document.getElementById('settingsBackdrop');
  const settingsCloseBtn = document.getElementById('settingsCloseBtn');
  const settingsResetBtn = document.getElementById('settingsResetBtn');
  const settingsRefreshBtn = document.getElementById('settingsRefreshBtn');
  const settingsLogoutBtn = document.getElementById('settingsLogoutBtn');
  const demoLoginBtn = document.getElementById('demoLoginBtn');
  const settingsStatus = document.getElementById('settingsStatus');

  const settingsKey = 'fh_demo_settings';
  
  const defaultSettings = {
    featuredFarmers: true,
    trendingProducts: true,
    nearbyItems: true,
    popularCategories: true,
    liveFeed: true,
    darkMode: false,
    compactFeed: false,
    animateCanvas: true
  };

  const pageSections = {
    featuredFarmers: document.getElementById('featuredFarmersSection'),
    trendingProducts: document.getElementById('trendingProductsSection'),
    nearbyItems: document.getElementById('nearbyItemsSection'),
    popularCategories: document.getElementById('popularCategoriesSection'),
    liveFeed: document.getElementById('liveFeedSection')
  };

  const settingInputs = {
    settingFeaturedFarmers: 'featuredFarmers',
    settingTrendingProducts: 'trendingProducts',
    settingNearbyItems: 'nearbyItems',
    settingPopularCategories: 'popularCategories',
    settingLiveFeed: 'liveFeed',
    settingDarkMode: 'darkMode',
    settingCompactFeed: 'compactFeed',
    settingAnimateCanvas: 'animateCanvas'
  };

  function getSettings() {
    try {
      const stored = JSON.parse(localStorage.getItem(settingsKey));
      return stored ? { ...defaultSettings, ...stored } : { ...defaultSettings };
    } catch (error) {
      console.warn('Settings load error:', error);
      return { ...defaultSettings };
    }
  }

  function saveSettings(settings) {
    try {
      localStorage.setItem(settingsKey, JSON.stringify(settings));
    } catch (error) {
      console.warn('Settings save error:', error);
    }
  }

  function updateSettingsStatus(message) {
    if (settingsStatus) {
      settingsStatus.textContent = message;
    }
  }

  function toggleSettingsPanel(open) {
    if (!settingsPanel || !settingsBackdrop) return;

    settingsPanel.classList.toggle('open', open);
    settingsBackdrop.classList.toggle('open', open);
    settingsPanel.setAttribute('aria-hidden', String(!open));
    navSettingsBtn?.setAttribute('aria-expanded', String(open));

    if (open) {
      settingsPanel.focus();
    }
  }

  function openSettingsPanel() {
    toggleSettingsPanel(true);
  }

  function closeSettingsPanel() {
    toggleSettingsPanel(false);
  }

  function applySettings(settings) {
    Object.keys(pageSections).forEach((key) => {
      const section = pageSections[key];
      if (section) {
        section.style.display = settings[key] ? '' : 'none';
      }
    });

    document.body.classList.toggle('dark-mode', settings.darkMode);
    document.body.classList.toggle('compact-cards', settings.compactFeed);

    const canvas = document.getElementById('fallingCanvas');
    if (canvas) {
      canvas.style.display = settings.animateCanvas ? 'block' : 'none';
    }

    updateSettingsStatus('? Settings applied and saved.');
  }

  function updateSettingsControls(settings) {
    Object.entries(settingInputs).forEach(([inputId, key]) => {
      const control = document.getElementById(inputId);
      if (control) {
        control.checked = Boolean(settings[key]);
      }
    });
  }

  function initEventListeners() {
    navSettingsBtn?.addEventListener('click', openSettingsPanel);
    settingsCloseBtn?.addEventListener('click', closeSettingsPanel);
    settingsBackdrop?.addEventListener('click', closeSettingsPanel);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && settingsPanel?.classList.contains('open')) {
        closeSettingsPanel();
      }
    });

    Object.keys(settingInputs).forEach((inputId) => {
      const control = document.getElementById(inputId);
      if (control) {
        control.addEventListener('change', () => {
          const latest = getSettings();
          latest[settingInputs[inputId]] = control.checked;
          saveSettings(latest);
          applySettings(latest);
        });
      }
    });

    settingsResetBtn?.addEventListener('click', () => {
      saveSettings(defaultSettings);
      updateSettingsControls(defaultSettings);
      applySettings(defaultSettings);
      updateSettingsStatus('? Preferences reset to defaults.');
    });

    settingsRefreshBtn?.addEventListener('click', () => {
      applySettings(getSettings());
      updateSettingsStatus('? Preview refreshed.');
    });

    settingsLogoutBtn?.addEventListener('click', () => {
      alert('Demo logout clicked - no actual session to clear');
      closeSettingsPanel();
    });

    demoLoginBtn?.addEventListener('click', () => {
      alert('Demo login - no backend required');
      demoLoginBtn.textContent = 'Demo User';
    });
  }

  function init() {
    const settings = getSettings();
    updateSettingsControls(settings);
    applySettings(settings);
    initEventListeners();
    console.log('? Settings initialized (demo mode - frontend only)');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
