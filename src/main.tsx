import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// After a redeploy the old hashed chunks are gone: reload once to pick up the
// new index.html instead of leaving the user on a dead page.
window.addEventListener('vite:preloadError', () => {
  try {
    if (sessionStorage.getItem('kiri.chunkReload')) return;
    sessionStorage.setItem('kiri.chunkReload', '1');
  } catch {
    return;
  }
  window.location.reload();
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
