
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GOOGLE_MAPS_API_KEY } from './config';

const renderApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("Could not find root element to mount to");
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Dynamically load the Google Maps script to securely inject the API key
if (GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== "PASTE_YOUR_GOOGLE_MAPS_API_KEY_HERE") {
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=marker`;
  script.async = true;
  document.head.appendChild(script);

  script.onload = () => {
    console.log('Google Maps script loaded successfully.');
    renderApp();
  };

  script.onerror = () => {
    console.error('Failed to load Google Maps script. Check your API key and network connection.');
    // Render the app anyway, components should handle the missing API gracefully
    renderApp();
  };
} else {
  console.warn("VITE_GOOGLE_MAPS_API_KEY is not set. Paste it in src/config.ts to enable map features.");
  renderApp();
}