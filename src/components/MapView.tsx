import React, { useEffect, useRef, useState } from 'react';
import type { CivicIssue, UserRole } from '../types';
import { IssueStatus } from '../types';
import { IssueDetailModal } from './IssueDetailModal'; // Assuming this will be created

const issueStatusColors: Record<IssueStatus, string> = {
  [IssueStatus.Pending]: 'red',
  [IssueStatus.InProgress]: 'orange',
  [IssueStatus.ForReview]: 'blue',
  [IssueStatus.Resolved]: 'green',
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
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(null);

  useEffect(() => {
    if (mapRef.current && !map && (window as any).google && (window as any).google.maps) {
      // Fix: Cast window to `any` to access the google maps API.
      const newMap = new (window as any).google.maps.Map(mapRef.current, {
        center: { lat: 34.0522, lng: -118.2437 }, // Default to LA, will be adjusted
        zoom: 10,
        mapId: 'CIVIC_ISSUE_TRACKER_MAP'
      });
      setMap(newMap);
    }
  }, [mapRef, map]);

  useEffect(() => {
    if (map && issues.length > 0 && (window as any).google && (window as any).google.maps) {
      // Clear old markers
      markers.forEach(marker => marker.setMap(null));
      const newMarkers: any[] = [];
      // Fix: Use `(window as any).google` to access maps functionality.
      const bounds = new (window as any).google.maps.LatLngBounds();

      issues.forEach(issue => {
        const icon = {
            // Fix: Use `(window as any).google` to access maps functionality.
            path: (window as any).google.maps.SymbolPath.CIRCLE,
            fillColor: issueStatusColors[issue.status],
            fillOpacity: 0.9,
            strokeColor: 'white',
            strokeWeight: 1.5,
            scale: 8
        };
        
        const marker = new (window as any).google.maps.Marker({
          position: issue.location,
          map,
          title: issue.title,
          icon: icon
        });

        marker.addListener('click', () => {
          setSelectedIssue(issue);
        });

        newMarkers.push(marker);
        bounds.extend(issue.location);
      });

      setMarkers(newMarkers);
      if (newMarkers.length > 0) {
        map.fitBounds(bounds);
        // Prevent zooming too far in if there's only one issue
        if(map.getZoom() && map.getZoom() > 16) {
            map.setZoom(16);
        }
      }
    } else if (map && issues.length === 0) {
        // Clear map if no issues
        markers.forEach(marker => marker.setMap(null));
        setMarkers([]);
    }
  }, [map, issues]);

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