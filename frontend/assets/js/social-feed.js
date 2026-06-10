(function setupSocialFeedPreview() {
  'use strict';

  const status = document.getElementById('composerStatus');
  const pendingActions = document.querySelectorAll('[data-pending-action]');
  const filterChips = document.querySelectorAll('[data-filter-chip]');
  const searchForm = document.getElementById('feedSearchForm');

  function showPendingMessage(message) {
    if (!status) return;
    status.textContent = message;
    status.classList.add('is-visible');

    window.clearTimeout(showPendingMessage.timeoutId);
    showPendingMessage.timeoutId = window.setTimeout(() => {
      status.textContent = 'Posting will be connected in the next development phase.';
      status.classList.remove('is-visible');
    }, 2800);
  }

  pendingActions.forEach((button) => {
    button.addEventListener('click', () => {
      showPendingMessage('This preview action will be connected in the next development phase.');
    });
  });

  filterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      filterChips.forEach((button) => {
        button.classList.remove('active');
        button.setAttribute('aria-pressed', 'false');
      });

      chip.classList.add('active');
      chip.setAttribute('aria-pressed', 'true');
      showPendingMessage('Filter selection is a visual preview until live feed data is connected.');
    });
  });

  if (searchForm) {
    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      showPendingMessage('Community post search will be connected in a later development phase.');
    });
  }
})();
