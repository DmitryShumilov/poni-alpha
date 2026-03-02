import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import reportWebVitals from './reportWebVitals';
import { initSentry } from './utils/sentry';

// Инициализация Sentry
initSentry({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE || 'development',
  release: import.meta.env.VITE_APP_VERSION || '0.2.0'
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Отправка Web Vitals в Sentry
reportWebVitals((metric) => {
  // Отправляем метрики производительности в Sentry
  if (import.meta.env.VITE_SENTRY_DSN) {
    import('./utils/sentry').then(({ logMessage }) => {
      logMessage(`Web Vitals ${metric.name}: ${metric.value}`, 'info');
    });
  }
});
