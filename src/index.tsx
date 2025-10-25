
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

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
if (GOOGLE_MAPS_API_KEY) {
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
  console.warn("GOOGLE_MAPS_API_KEY environment variable is not set. Map features will be disabled.");
  renderApp();
}
