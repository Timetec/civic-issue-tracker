import React, { useEffect, useRef } from 'react';

interface StaticMapPreviewProps {
  location: { lat: number; lng: number };
}

export const StaticMapPreview: React.FC<StaticMapPreviewProps> = ({ location }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  // Fix: Cast `window` to `any` to access the `google` object loaded by an external script, avoiding TypeScript errors.
  const isGoogleMapsLoaded = typeof (window as any).google !== 'undefined' && typeof (window as any).google.maps !== 'undefined';

  useEffect(() => {
    if (isGoogleMapsLoaded && mapRef.current) {
      // Fix: Use `(window as any).google` to access Maps API.
      const map = new (window as any).google.maps.Map(mapRef.current, {
        center: location,
        zoom: 16,
        disableDefaultUI: true,
        gestureHandling: 'none',
        mapId: 'CIVIC_ISSUE_MAP_PREVIEW',
      });
      // Fix: Use `(window as any).google` to access Maps API.
      new (window as any).google.maps.marker.AdvancedMarkerElement({
        position: location,
        map: map,
      });
    }
  }, [location, isGoogleMapsLoaded]);

  if (!isGoogleMapsLoaded) {
    return <div className="h-40 w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm text-gray-500 rounded">Map requires API Key.</div>;
  }

  return <div ref={mapRef} className="h-40 w-full rounded-md" />;
};