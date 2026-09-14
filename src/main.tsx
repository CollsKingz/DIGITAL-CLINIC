import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App.tsx';
import './index.css';

const rawDsn = import.meta.env.VITE_SENTRY_DSN;
if (rawDsn) {
  const cleanDsn = String(rawDsn).trim().replace(/['",;]+$/, '').replace(/^['"]+/, '');
  if (cleanDsn) {
    try {
      Sentry.init({
        dsn: cleanDsn,
        tracesSampleRate: 1.0,
      });
    } catch (err) {
      console.warn("Failed to initialize Sentry with provided DSN:", err);
    }
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

