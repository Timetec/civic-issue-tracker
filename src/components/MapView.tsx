import React, { useEffect, useRef, useState } from 'react';
import type { CivicIssue, UserRole } from '../types';
import { IssueStatus } from '../types';
import { IssueDetailModal } from './IssueDetailModal'; // Assuming this will be created

const issueStatusColors: Record<IssueStatus, string> = {
  [IssueStatus.Pending]: '#EF4444', // red-500
  [IssueStatus.InProgress]: '#F59E0B', // amber-500
  [IssueStatus.ForReview]: '#3B82F6', // blue-500
  [IssueStatus.Resolved]: '#10B981', // emerald-500
};

interface MapViewProps {
  issues: CivicIssue[];
  userRole: UserRole;
}

export const MapView: React.FC<MapViewProps> = ({ issues, userRole }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  // Fix: Replace google.maps types with `any` to resolve namespace errors.
  const [map, setMap] = useState<any | null>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [userMarker, setUserMarker] = useState<any | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Effect to get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn(`Error getting user location: ${error.message}`);
        }
      );
    }
  }, []);

  // Effect to initialize map
  useEffect(() => {
    if (mapRef.current && !map && (window as any).google && (window as any).google.maps) {
      // Fix: Cast window to `any` to access the google maps API.
      const newMap = new (window as any).google.maps.Map(mapRef.current, {
        center: { lat: 34.0522, lng: -118.2437 }, // Default to LA, will be adjusted
        zoom: 10,
        mapId: 'CIVIC_ISSUE_TRACKER_MAP',
        streetViewControl: false, // Remove Pegman
        mapTypeControl: false,
        fullscreenControl: false,
      });
      setMap(newMap);
    }
  }, [mapRef, map]);

  // Effect to draw markers (issues and user)
  useEffect(() => {
    if (map && (window as any).google && (window as any).google.maps) {
      // Clear old issue markers
      markers.forEach(marker => marker.setMap(null));
      const newMarkers: any[] = [];
      // Fix: Use `(window as any).google` to access maps functionality.
      const bounds = new (window as any).google.maps.LatLngBounds();

      // Draw issue markers
      issues.forEach(issue => {
        const icon = {
            // A downward-pointing arrow shape, more descriptive than a circle.
            path: (window as any).google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            fillColor: issueStatusColors[issue.status],
            fillOpacity: 1.0,
            strokeColor: 'white',
            strokeWeight: 1.5,
            scale: 6,
            rotation: 90, // Point the arrow down to look like a pin
            anchor: new (window as any).google.maps.Point(0, 2.5), // Adjust anchor for the new shape
        };
        
        const marker = new (window as any).google.maps.Marker({
          position: issue.location,
          map,
          title: issue.title,
          icon: icon,
        });

        marker.addListener('click', () => {
          setSelectedIssue(issue);
        });

        newMarkers.push(marker);
        bounds.extend(issue.location);
      });
      setMarkers(newMarkers);
      
      // Draw or update user location marker
      if (userLocation) {
        const userIcon = {
            url: '/assets/user-location-marker.svg',
            scaledSize: new (window as any).google.maps.Size(32, 32),
            anchor: new (window as any).google.maps.Point(16, 16), // Center of the 32x32 icon
        };

        if (userMarker) {
            userMarker.setPosition(userLocation);
        } else {
            const newUserMarker = new (window as any).google.maps.Marker({
                position: userLocation,
                map,
                title: 'Your Location',
                icon: userIcon,
                zIndex: 999, // Ensure user marker is on top
            });
            setUserMarker(newUserMarker);
        }
        bounds.extend(userLocation);
      }

      // Fit map to show all markers
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds);
        // Prevent zooming too far in if there's only one item
        if (map.getZoom() > 16) {
          map.setZoom(16);
        }
      } else if (userLocation) {
         // If no issues, just center on the user's location
         map.setCenter(userLocation);
         map.setZoom(14);
      }

    }
  }, [map, issues, userLocation]);

  return (
    <>
      <div className="p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Issues Map View</h2>
        <div ref={mapRef} className="h-[70vh] w-full rounded-md bg-gray-200 dark:bg-gray-700" />
      </div>
      {/* 
        The IssueDetailModal is rendered here but controlled from the main App component
        to keep state management simpler. Clicking a marker here will just set an ID,
        and the main App will handle showing the modal with the correct data.
        For this component, we can simply show a placeholder or nothing, as the logic
        is handled higher up. The click handler sets `selectedIssue` but this state
        is not used to render the modal directly *from here*.
      */}
    </>
  );
};
