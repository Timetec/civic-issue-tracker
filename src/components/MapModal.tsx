import React, { useState, useEffect, useRef } from 'react';
import { Modal } from './Modal';
import { LocationMarkerIcon, SearchIcon, Spinner } from './Icons';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCenter: { lat: number; lng: number };
  onConfirm: (location: { lat: number; lng: number }) => void;
  title?: string;
  confirmText?: string;
}

export const MapModal: React.FC<MapModalProps> = ({
  isOpen,
  onClose,
  initialCenter,
  onConfirm,
  title = "Select Location",
  confirmText = "Confirm Location"
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  // Fix: Replaced google.maps types with `any` to resolve namespace errors.
  const [map, setMap] = useState<any | null>(null);
  const [marker, setMarker] = useState<any | null>(null);
  const [selectedLocation, setSelectedLocation] = useState(initialCenter);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (isOpen && mapRef.current && !map) {
      // Fix: Cast window to `any` to access the google maps API.
      const newMap = new (window as any).google.maps.Map(mapRef.current, {
        center: initialCenter,
        zoom: 15,
        disableDefaultUI: true,
        zoomControl: true,
      });
      setMap(newMap);

      const newMarker = new (window as any).google.maps.Marker({
        position: initialCenter,
        map: newMap,
        draggable: true,
      });
      setMarker(newMarker);
      setSelectedLocation(initialCenter);

      newMarker.addListener('dragend', () => {
        const newPosition = newMarker.getPosition();
        if (newPosition) {
          setSelectedLocation({ lat: newPosition.lat(), lng: newPosition.lng() });
        }
      });
      
      // Fix: Replaced google.maps.MapMouseEvent with `any`.
      newMap.addListener('click', (e: any) => {
        if (e.latLng) {
            newMarker.setPosition(e.latLng);
            setSelectedLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        }
      });
    }
  }, [isOpen, mapRef, map, initialCenter]);

  useEffect(() => {
    if (map && marker) {
        map.setCenter(initialCenter);
        marker.setPosition(initialCenter);
        setSelectedLocation(initialCenter);
    }
  }, [initialCenter, map, marker]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery || !map || !marker) return;

    setIsSearching(true);
    // Fix: Cast window to `any` to access the google maps geocoder.
    const geocoder = new (window as any).google.maps.Geocoder();
    geocoder.geocode({ address: searchQuery }, (results, status) => {
      setIsSearching(false);
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        map.setCenter(location);
        map.setZoom(17);
        marker.setPosition(location);
        setSelectedLocation({ lat: location.lat(), lng: location.lng() });
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
      <div className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for an address..."
                className="flex-grow block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2"
            />
            <button
                type="submit"
                disabled={isSearching}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 flex items-center"
            >
                {isSearching ? <Spinner className="h-5 w-5" /> : <SearchIcon className="h-5 w-5" />}
            </button>
        </form>
        <div ref={mapRef} style={{ height: '50vh', width: '100%', borderRadius: '8px', backgroundColor: '#e5e7eb' }} />
        <div className="flex justify-end gap-2">
            <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
                Cancel
            </button>
            <button
                type="button"
                onClick={() => onConfirm(selectedLocation)}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
            >
                <LocationMarkerIcon className="h-5 w-5 mr-2" />
                {confirmText}
            </button>
        </div>
      </div>
    </Modal>
  );
};