import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { registerSW } from 'virtual:pwa-register';

// In development / preview iframe, safely handle service worker registration without throwing
try {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    if (import.meta.env.DEV) {
      navigator.serviceWorker?.getRegistrations?.().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().catch(() => {});
        }
      }).catch(() => {});
    } else {
      registerSW({ immediate: true });
    }
  }
} catch {
  // Gracefully ignore service worker errors in sandboxed preview iframes
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
