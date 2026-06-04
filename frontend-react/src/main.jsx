import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App.jsx';
import './styles.css';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const pendingPath = window.sessionStorage.getItem('fh_spa_path');

if (pendingPath) {
  window.sessionStorage.removeItem('fh_spa_path');
  const normalizedPath = pendingPath.startsWith('/') ? pendingPath : `/${pendingPath}`;
  window.history.replaceState(null, '', `${basePath}${normalizedPath}`);
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
