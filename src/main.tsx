import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { initPWAInstall, initPWAMonitoring } from './lib/pwa';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

// Initialize PWA functionality
initPWAInstall();
initPWAMonitoring();

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
