import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, LocationMap } from './ui';
import { api } from '@/lib/api';
export default function LiveTracking({ bookingId, clientLocation }) {
    const [tracking, setTracking] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const fetchTrackingData = async () => {
            try {
                const response = await api.get(`/tracking/${bookingId}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.tracking) {
                        setTracking(data.tracking);
                    }
                }
                else {
                    setTracking(null);
                }
            }
            catch (error) {
                setTracking(null);
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchTrackingData();
        const interval = setInterval(() => {
            setTracking((prev) => prev ? {
                ...prev,
                lastUpdated: new Date().toISOString()
            } : null);
        }, 10000);
        return () => clearInterval(interval);
    }, [bookingId]);
    if (isLoading) {
        return (_jsx(Card, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-center", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600" }), _jsx("span", { className: "ml-3 text-gray-600", children: "Loading tracking info..." })] }) }));
    }
    if (!tracking) {
        return (_jsx(Card, { className: "p-6", children: _jsx("p", { className: "text-gray-600 text-center", children: "Tracking not available" }) }));
    }
    const statusConfig = {
        'on-way': {
            icon: '🚗',
            label: 'On the Way',
            color: 'bg-blue-100 text-blue-800',
            description: 'Your cleaner is heading to your location'
        },
        'arrived': {
            icon: '📍',
            label: 'Arrived',
            color: 'bg-green-100 text-green-800',
            description: 'Your cleaner has arrived'
        },
        'in-progress': {
            icon: '🧹',
            label: 'In Progress',
            color: 'bg-yellow-100 text-yellow-800',
            description: 'Your cleaner is working on the service'
        },
        confirmed: {
            icon: '✓',
            label: 'Confirmed',
            color: 'bg-green-100 text-green-800',
            description: 'Cleaner has confirmed the booking'
        },
        completed: {
            icon: '',
            label: 'Completed',
            color: 'bg-blue-100 text-blue-800',
            description: 'Service has been completed'
        },
    };
    const config = statusConfig[tracking.status] || statusConfig['confirmed'];
    return (_jsxs("div", { className: "space-y-4", children: [_jsx(Card, { className: "p-6", children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "text-4xl", children: config.icon }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: `inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.color} mb-2`, children: [_jsx("span", { className: "w-2 h-2 bg-current rounded-full animate-pulse" }), config.label] }), _jsx("p", { className: "text-gray-600 text-sm", children: config.description }), tracking.estimatedArrival && tracking.status === 'on-way' && (_jsxs("div", { className: "mt-3 flex items-center gap-2 text-sm", children: [_jsx("svg", { className: "w-5 h-5 text-gray-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }) }), _jsxs("span", { className: "text-gray-700 font-medium", children: ["ETA: ", new Date(tracking.estimatedArrival).toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })] })] }))] })] }) }), _jsxs(Card, { className: "p-4 overflow-hidden", children: [_jsx(LocationMap, { location: clientLocation, title: "Work Site Location", height: "300px" }), _jsxs("p", { className: "text-xs text-gray-500 mt-2 text-center", children: ["Last updated: ", new Date(tracking.lastUpdated).toLocaleTimeString()] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("button", { className: "flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-lg hover:border-yellow-400 transition-colors", children: [_jsx("svg", { className: "w-5 h-5 text-gray-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" }) }), _jsx("span", { className: "text-sm font-medium", children: "Call" })] }), _jsxs("button", { className: "flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-lg hover:border-yellow-400 transition-colors", children: [_jsx("svg", { className: "w-5 h-5 text-gray-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" }) }), _jsx("span", { className: "text-sm font-medium", children: "Message" })] })] })] }));
}
