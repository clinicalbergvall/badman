import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { Card } from './ui';
export default function LocationMap({ location, title = "Client Location", height = "300px", draggable = false, onLocationChange, showMap = true }) {
    const mapRef = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [error, setError] = useState(null);
    const displayAddress = location.manualAddress || location.address || "Unknown location";
    // Default to Nairobi center if no coordinates (approximate)
    const defaultCenter = [-1.2921, 36.8219];
    // Validate coordinates before using them
    const position = location.coordinates &&
        Array.isArray(location.coordinates) &&
        location.coordinates.length === 2 &&
        typeof location.coordinates[0] === 'number' &&
        typeof location.coordinates[1] === 'number' &&
        !isNaN(location.coordinates[0]) &&
        !isNaN(location.coordinates[1]) &&
        isFinite(location.coordinates[0]) &&
        isFinite(location.coordinates[1])
        ? [location.coordinates[0], location.coordinates[1]]
        : defaultCenter;
    // Check if coordinates are valid before rendering
    const hasValidCoordinates = location.coordinates &&
        Array.isArray(location.coordinates) &&
        location.coordinates.length === 2 &&
        typeof location.coordinates[0] === 'number' &&
        typeof location.coordinates[1] === 'number' &&
        !isNaN(location.coordinates[0]) &&
        !isNaN(location.coordinates[1]) &&
        isFinite(location.coordinates[0]) &&
        isFinite(location.coordinates[1]);
    useEffect(() => {
        if (!mapRef.current || !import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
            setError('Google Maps API key is not configured');
            return;
        }
        const initMap = async () => {
            try {
                // Load Google Maps script dynamically
                if (!window.google) {
                    const script = document.createElement('script');
                    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
                    script.async = true;
                    script.defer = true;
                    script.onerror = () => {
                        setError('Failed to load Google Maps');
                    };
                    document.head.appendChild(script);
                    script.onload = () => {
                        loadMap();
                    };
                }
                else {
                    loadMap();
                }
                function loadMap() {
                    let lat = position[0];
                    let lng = position[1];
                    let zoom = 15;
                    if (location.coordinates) {
                        // Use provided coordinates
                        [lat, lng] = location.coordinates;
                    }
                    else if (location.address || location.manualAddress) {
                        // Geocode address to get coordinates
                        const geocoder = new window.google.maps.Geocoder();
                        const address = location.manualAddress || location.address || '';
                        geocoder.geocode({ address }, (results, status) => {
                            if (status === 'OK' && results[0]) {
                                const coords = results[0].geometry.location;
                                lat = coords.lat();
                                lng = coords.lng();
                                const map = new window.google.maps.Map(mapRef.current, {
                                    center: { lat, lng },
                                    zoom: zoom,
                                });
                                const marker = new window.google.maps.Marker({
                                    position: { lat, lng },
                                    map,
                                    title: title,
                                    draggable: draggable,
                                });
                                if (draggable && onLocationChange) {
                                    marker.addListener('dragend', (e) => {
                                        onLocationChange(e.latLng.lat(), e.latLng.lng());
                                    });
                                }
                                setMapLoaded(true);
                            }
                            else {
                                setError('Unable to geocode the address');
                                console.error('Geocoding failed:', status);
                            }
                        });
                        return;
                    }
                    // Create map with default or provided coordinates
                    const map = new window.google.maps.Map(mapRef.current, {
                        center: { lat, lng },
                        zoom: zoom,
                    });
                    // Add marker if coordinates are available
                    const marker = new window.google.maps.Marker({
                        position: { lat: position[0], lng: position[1] },
                        map,
                        title: title,
                        draggable: draggable,
                    });
                    if (draggable && onLocationChange) {
                        marker.addListener('dragend', (e) => {
                            onLocationChange(e.latLng.lat(), e.latLng.lng());
                        });
                    }
                    setMapLoaded(true);
                }
            }
            catch (err) {
                setError('Error initializing map');
                console.error('Map initialization error:', err);
            }
        };
        initMap();
    }, [location, title, draggable, onLocationChange]);
    if (!hasValidCoordinates && !location.manualAddress && !location.address) {
        if (showMap) { // Only show the fallback UI if showMap is true
            return (_jsxs(Card, { className: "p-4", children: [_jsxs("div", { className: "mb-3", children: [_jsx("h3", { className: "font-semibold text-gray-900", children: title }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "No location data available" })] }), _jsx("div", { className: "rounded-lg overflow-hidden bg-gray-100 z-0 relative", style: { height: height }, children: _jsx("div", { className: "w-full h-full flex items-center justify-center bg-gray-50 text-gray-500", children: _jsx("p", { children: "No location to display" }) }) })] }));
        }
        else {
            // If showMap is false and no location data, just show the title and message
            return (_jsx(Card, { className: "p-4", children: _jsxs("div", { className: "mb-3", children: [_jsx("h3", { className: "font-semibold text-gray-900", children: title }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "No location data available" })] }) }));
        }
    }
    return (_jsxs(Card, { className: "p4", children: [_jsxs("div", { className: "mb-3", children: [_jsx("h3", { className: "font-semibold text-gray-900", children: title }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: displayAddress })] }), showMap && (_jsx("div", { className: "rounded-lg overflow-hidden bg-gray-100 z-0 relative", style: { height: height }, children: _jsx("div", { ref: mapRef, className: "w-full h-full", style: { minHeight: height }, children: !mapLoaded && !error && (_jsx("div", { className: "w-full h-full flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" }) })) }) })), hasValidCoordinates && (_jsxs("div", { className: "flex items-center justify-between mt-2", children: [_jsxs("p", { className: "text-xs text-gray-500", children: [location.coordinates[0].toFixed(6), ", ", location.coordinates[1].toFixed(6)] }), _jsxs("a", { href: `https://www.google.com/maps/dir/?api=1&destination=${location.coordinates[0]},${location.coordinates[1]}`, target: "_blank", rel: "noopener noreferrer", className: "text-xs text-blue-600 font-bold hover:underline flex items-center gap-1", children: [_jsx("span", { children: "\uD83E\uDDED" }), " Get Directions"] })] }))] }));
}
