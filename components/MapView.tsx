import React, { useEffect, useRef, useState } from 'react';
import type { CivicIssue } from '../types';
import { IssueStatus, UserRole } from '../types';
import { Spinner } from './Icons';

interface MapViewProps {
    issues: CivicIssue[];
    userRole: UserRole;
}

const statusColors: { [key in IssueStatus]: { bg: string; border: string; glyph: string } } = {
    [IssueStatus.Pending]: { bg: '#FECACA', border: '#DC2626', glyph: '#DC2626' }, // red-300 bg, red-600 border/glyph
    [IssueStatus.InProgress]: { bg: '#FDE68A', border: '#D97706', glyph: '#D97706' }, // amber-200 bg, amber-600 border/glyph
    [IssueStatus.ForReview]: { bg: '#BFDBFE', border: '#2563EB', glyph: '#2563EB' }, // blue-200 bg, blue-600 border/glyph
    [IssueStatus.Resolved]: { bg: '#A7F3D0', border: '#059669', glyph: '#059669' }, // emerald-200 bg, emerald-600 border/glyph
};


export const MapView: React.FC<MapViewProps> = ({ issues, userRole }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<any[]>([]);
    const [map, setMap] = useState<any | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isGoogleMapsLoaded = typeof (window as any).google !== 'undefined' && typeof (window as any).google.maps !== 'undefined';

    // 1. Get user's location
    useEffect(() => {
        setIsLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setIsLoading(false);
            },
            (err) => {
                console.warn(`Could not get user location: ${err.message}. Defaulting to Los Angeles.`);
                setUserLocation({ lat: 34.0522, lng: -118.2437 }); // Default to LA
                setError("Could not access your location. Showing issues for a default area.");
                setIsLoading(false);
            }
        );
    }, []);

    // 2. Initialize map
    useEffect(() => {
        if (isGoogleMapsLoaded && mapRef.current && userLocation && !map) {
            const newMap = new (window as any).google.maps.Map(mapRef.current, {
                center: userLocation,
                zoom: 13,
                mapId: 'CIVIC_ISSUE_MAIN_MAP',
                disableDefaultUI: true,
                zoomControl: true,
            });
            setMap(newMap);
        }
    }, [isGoogleMapsLoaded, userLocation, map]);
    
    // 3. Add markers to map
    useEffect(() => {
        if (map) {
            // Clear previous markers to prevent duplicates on re-render
            markersRef.current.forEach(marker => marker.map = null);
            markersRef.current = [];

            const infoWindow = new (window as any).google.maps.InfoWindow();

            // Add a distinct marker for the user's current location
            if (userLocation) {
                 const userMarkerPin = new (window as any).google.maps.marker.PinElement({
                    background: '#007BFF', // A distinct blue
                    borderColor: '#FFFFFF',
                    glyphColor: '#FFFFFF',
                });

                const userMarker = new (window as any).google.maps.marker.AdvancedMarkerElement({
                    position: userLocation,
                    map: map,
                    title: 'Your Location',
                    content: userMarkerPin.element,
                    zIndex: 10 // Ensure user marker is on top
                });
                markersRef.current.push(userMarker);
            }

            // Add markers for each civic issue
            issues.forEach(issue => {
                const colorConfig = statusColors[issue.status] || statusColors[IssueStatus.Pending];
                
                const pin = new (window as any).google.maps.marker.PinElement({
                    background: colorConfig.bg,
                    borderColor: colorConfig.border,
                    glyphColor: colorConfig.glyph,
                });

                const marker = new (window as any).google.maps.marker.AdvancedMarkerElement({
                    position: issue.location,
                    map: map,
                    title: issue.title,
                    content: pin.element,
                });

                marker.addListener('click', () => {
                    const content = `
                        <div style="font-family: sans-serif; padding: 8px; max-w: 250px;">
                            <h3 style="font-weight: bold; font-size: 1rem; margin: 0 0 4px 0;">${issue.title}</h3>
                            <p style="font-size: 0.875rem; color: #4B5563; margin: 0 0 8px 0;">${issue.category}</p>
                            <span style="font-size: 0.75rem; padding: 2px 8px; border-radius: 9999px; background-color: ${colorConfig.bg}; color: ${colorConfig.border}; font-weight: 500;">
                                ${issue.status}
                            </span>
                        </div>
                    `;
                    infoWindow.setContent(content);
                    infoWindow.open(map, marker);
                });
                markersRef.current.push(marker);
            });
        }
    }, [map, issues, userLocation]);


    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="w-full h-full flex flex-col justify-center items-center">
                    <Spinner className="h-10 w-10 text-indigo-500" />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Getting your location...</p>
                </div>
            );
        }
        if (!isGoogleMapsLoaded) {
            return (
                <div className="w-full h-full flex items-center justify-center text-sm text-gray-500 rounded">
                    Map requires a valid Google Maps API Key.
                </div>
            );
        }
        return <div ref={mapRef} className="w-full h-full" />;
    };

    const mapTitle = userRole === UserRole.Worker ? "Your Assigned Issues Map" : "Nearby Issues Map";

    return (
        <div className="p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg h-[75vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{mapTitle}</h2>
                 {error && <p className="text-sm text-yellow-600 dark:text-yellow-400">{error}</p>}
            </div>
            <div className="flex-grow w-full h-full bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden">
                {renderContent()}
            </div>
        </div>
    );
};