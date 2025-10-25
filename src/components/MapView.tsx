import React, { useEffect, useRef, useState } from 'react';
import type { CivicIssue, UserRole } from '../types';
import { IssueStatus } from '../types';

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

const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    const pluralize = (count: number, noun: string) => `${count} ${noun}${count !== 1 ? 's' : ''} ago`;

    let interval = seconds / 31536000;
    if (interval > 1) return pluralize(Math.floor(interval), "year");
    interval = seconds / 2592000;
    if (interval > 1) return pluralize(Math.floor(interval), "month");
    interval = seconds / 86400;
    if (interval > 1) return pluralize(Math.floor(interval), "day");
    interval = seconds / 3600;
    if (interval > 1) return pluralize(Math.floor(interval), "hour");
    interval = seconds / 60;
    if (interval > 1) return pluralize(Math.floor(interval), "minute");
    return pluralize(Math.floor(seconds), "second");
};

export const MapView: React.FC<MapViewProps> = ({ issues, userRole }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  // Fix: Replace google.maps types with `any` to resolve namespace errors.
  const [map, setMap] = useState<any | null>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [userMarker, setUserMarker] = useState<any | null>(null);
  const [infoWindow, setInfoWindow] = useState<any | null>(null);
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

  // Effect to initialize map and InfoWindow
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
      setInfoWindow(new (window as any).google.maps.InfoWindow());
    }
  }, [mapRef, map]);

  // Effect to draw markers (issues and user)
  useEffect(() => {
    if (map && infoWindow && (window as any).google && (window as any).google.maps) {
      // Close any open info window when issues change
      infoWindow.close();
      
      // Clear old issue markers
      markers.forEach(marker => marker.setMap(null));
      const newMarkers: any[] = [];
      // Fix: Use `(window as any).google` to access maps functionality.
      const bounds = new (window as any).google.maps.LatLngBounds();

      // Close infowindow on map click
      map.addListener('click', () => {
        infoWindow.close();
      });

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
          const shortDescription = issue.description.length > 100 
            ? issue.description.substring(0, 100) + '...' 
            : issue.description;

            const contentString = `
            <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; max-width: 250px; padding: 5px;">
              <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 8px 0; color: #1a1a1a;">${issue.title}</h3>
              <p style="margin: 0 0 10px 0; line-height: 1.4; font-size: 13px;">${shortDescription}</p>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eee; padding-top: 8px; font-size: 12px;">
                <span style="font-weight: 500; color: ${issueStatusColors[issue.status]};">${issue.status}</span>
                <span style="color: #666;">${timeAgo(issue.createdAt)}</span>
              </div>
            </div>`;

          infoWindow.setContent(contentString);
          infoWindow.open({
            anchor: marker,
            map,
          });
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
  }, [map, issues, userLocation, infoWindow]);

  return (
    <>
      <div className="p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Issues Map View</h2>
        <div ref={mapRef} className="h-[70vh] w-full rounded-md bg-gray-200 dark:bg-gray-700" />
      </div>
    </>
  );
};
