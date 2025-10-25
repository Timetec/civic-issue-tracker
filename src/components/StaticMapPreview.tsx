// Fix: Add triple-slash directive to include Vite client types and resolve import.meta.env error.
/// <reference types="vite/client" />

import React, { useState, useEffect } from 'react';
import { MapPinIcon } from './Icons';

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

interface StaticMapPreviewProps {
  location: { lat: number; lng: number };
  className?: string;
}

export const StaticMapPreview: React.FC<StaticMapPreviewProps> = ({ location, className }) => {
  const [hasError, setHasError] = useState(false);
  
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