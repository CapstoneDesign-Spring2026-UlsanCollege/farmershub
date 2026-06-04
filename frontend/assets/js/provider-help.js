import { requireProvider } from './provider-shell.js';

document.addEventListener('DOMContentLoaded', async () => {
  await requireProvider();
});
