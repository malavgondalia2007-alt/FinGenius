import React from 'react';
import './index.css';
import { createRoot } from 'react-dom/client';
import { App } from './App';

// Global error handler for debugging
window.onerror = (message, source, lineno, colno, error) => {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding: 20px; color: red; background: #fff; font-family: sans-serif;">
        <h1>App Crash Detected</h1>
        <p>${message}</p>
        <pre>${error?.stack || ''}</pre>
        <p>Please share this with the developer.</p>
      </div>
    `;
  }
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');
const root = createRoot(rootElement);

try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error: any) {
  rootElement.innerHTML = `<div style="color: red; padding: 20px;">Render Error: ${error.message}</div>`;
}