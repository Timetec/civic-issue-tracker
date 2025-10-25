import React, { useState, useEffect } from 'react';
import { MapPinIcon } from './Icons';

// Helper to extract the Google Maps API key from the script tag in the DOM.
// This is a workaround for environments where process.env is not available client-side.
const getGoogleMapsApiKey = (): string | null => {
  // Memoize the result so we don't scan the DOM every time.
  if ((window as any)._googleMapsApiKey) return (window as any)._googleMapsApiKey;
  if ((window as any)._googleMapsApiKey === null) return null; // Already failed once.

  const scripts = Array.from(document.scripts);
  const mapsScript = scripts.find(script => script.src.includes('maps.googleapis.com/maps/api/js'));
  
  if (mapsScript) {
    try {
      const url = new URL(mapsScript.src);
      const key = url.searchParams.get('key');
       // Don't cache a placeholder key
      if (key === 'YOUR_GOOGLE_MAPS_API_KEY') {
        return null;
      }
      (window as any)._googleMapsApiKey = key;
      return key;
    } catch (e) {
      console.error("Could not parse Google Maps script URL", e);
      (window as any)._googleMapsApiKey = null;
      return null;
    }
  }
  (window as any)._googleMapsApiKey = null;
  return null;
};


interface StaticMapPreviewProps {
  location: { lat: number; lng: number };
  className?: string;
}

export const StaticMapPreview: React.FC<StaticMapPreviewProps> = ({ location, className }) => {
  const [hasError, setHasError] = useState(false);
  const MAPS_API_KEY = getGoogleMapsApiKey();
  
  // Reset error state if location changes, so we can retry loading the image.
  useEffect(() => {
    setHasError(false);
  }, [location]);

  if (!MAPS_API_KEY) {
    return (
      <div className={`bg-gray-200 dark:bg-gray-700 flex flex-col items-center justify-center text-center p-2 text-sm text-gray-500 rounded ${className}`}>
        <MapPinIcon className="h-8 w-8 text-gray-400 mb-2" />
        <span className="font-semibold">Map Unavailable</span>
        <span>A valid Google Maps API Key is required.</span>
      </div>
    );
  }

  // Use a higher resolution for retina displays by default
  const scale = window.devicePixelRatio > 1 ? 2 : 1;
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${location.lat},${location.lng}&zoom=16&size=600x400&scale=${scale}&maptype=roadmap&markers=color:red%7C${location.lat},${location.lng}&key=${MAPS_API_KEY}`;
  
  if (hasError) {
    return (
       <div className={`bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 flex flex-col items-center justify-center text-center p-2 text-sm text-red-700 dark:text-red-200 rounded ${className}`}>
        <MapPinIcon className="h-8 w-8 text-red-500 mb-2" />
        <span className="font-semibold">Map Failed to Load</span>
        <span>Please check the API key and ensure the "Maps Static API" is enabled in your Google Cloud project.</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <img
        src={mapUrl}
        alt={`Map view of issue at ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
        className="w-full h-full object-cover"
        loading="lazy"
        onError={() => setHasError(true)}
      />
    </div>
  );
};