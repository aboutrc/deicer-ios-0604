import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';

// Unregister service workers in development
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
}

// Import App component lazily
const App = lazy(() => import('./App'));
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <Suspense fallback={<div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-white text-xl">Loading...</div>
  </div>}>
    <App />
  </Suspense>
);