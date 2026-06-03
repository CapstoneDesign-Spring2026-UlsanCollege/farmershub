import {
  hydrateCustomerShell,
  setStatus,
} from './customer-shell.js';

const form = document.getElementById('helpSearchForm');
const input = document.getElementById('helpSearchInput');
const topics = Array.from(document.querySelectorAll('[data-help-topic]'));
const statusEl = document.getElementById('helpStatus');

function filterTopics() {
  const query = String(input?.value || '').trim().toLowerCase();
  let visibleCount = 0;

  topics.forEach((topic) => {
    const text = topic.textContent.toLowerCase();
    const visible = !query || text.includes(query);
    topic.classList.toggle('is-hidden', !visible);
    if (visible) visibleCount += 1;
  });

  setStatus(statusEl, query
    ? `${visibleCount} help topic${visibleCount === 1 ? '' : 's'} shown.`
    : 'Customer help topics shown.');
}

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  filterTopics();
});

input?.addEventListener('input', filterTopics);

hydrateCustomerShell();
filterTopics();
