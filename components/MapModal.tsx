import React, { useEffect, useRef, useState } from 'react';
import { Modal } from './Modal';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCenter: { lat: number; lng: number };
  onConfirm: (location: { lat: number; lng: number }) => void;
}

export const MapModal: React.FC<MapModalProps> = ({ isOpen, onClose, initialCenter, onConfirm }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedLocation, setSelectedLocation] = useState(initialCenter);

  // When the modal is opened, reset the selected location to the initial one provided.
  useEffect(() => {
    if (isOpen) {
      setSelectedLocation(initialCenter);
    }
  }, [isOpen, initialCenter]);

  // Check if Google Maps API script has loaded
  // Fix: Cast `window` to `any` to access the `google` object loaded by an external script, avoiding TypeScript errors.
  const isGoogleMapsLoaded = typeof (window as any).google !== 'undefined' && typeof (window as any).google.maps !== 'undefined';

  // Initialize the map and marker when the modal is open and the API is ready.
  useEffect(() => {
    if (isOpen && isGoogleMapsLoaded && mapRef.current) {
      // Fix: Use `(window as any).google` to access Maps API.
      const map = new (window as any).google.maps.Map(mapRef.current, {
        center: initialCenter,
        zoom: 15,
        mapId: 'CIVIC_ISSUE_MAP_MODAL',
        disableDefaultUI: true,
      });

      // Fix: Use `(window as any).google` to access Maps API.
      const marker = new (window as any).google.maps.marker.AdvancedMarkerElement({
        position: initialCenter,
        map: map,
        gmpDraggable: true,
        title: 'Drag me to the issue location',
      });

      // Listen for the drag event to update the selected location
      const listener = marker.addListener('dragend', (e: any) => {
        setSelectedLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() });
      });

      // Cleanup listener on component unmount or re-render
      return () => {
        if ((window as any).google && listener) {
          (window as any).google.maps.event.removeListener(listener);
        }
      };
    }
  }, [isOpen, isGoogleMapsLoaded, initialCenter]); // Re-initialize if these change

  const handleConfirm = () => {
    onConfirm(selectedLocation);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4 md:p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Select Location</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Click and drag the pin to the exact location.
        </p>
        <div className="relative w-full h-80 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden">
          {isGoogleMapsLoaded ? (
            <div ref={mapRef} className="w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-500 rounded">
                Map requires API Key.
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </Modal>
  );
};
