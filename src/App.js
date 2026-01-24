import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Booking from './pages/BookingEnhanced';
import { Badge } from '@/components/ui';
import React from 'react';
const { useEffect, useState } = React;
export default function App() {
    const [performanceMode, setPerformanceMode] = useState(false);
    useEffect(() => {
        const savedPerf = localStorage.getItem('performanceMode');
        setPerformanceMode(savedPerf === 'true');
    }, []);
    return (_jsxs("div", { className: "w-full relative", children: [!performanceMode && (_jsxs("div", { className: "fixed inset-0 -z-10 overflow-hidden pointer-events-none", children: [_jsx("div", { className: "absolute top-0 -left-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" }), _jsx("div", { className: "absolute top-0 -right-4 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" }), _jsx("div", { className: "absolute -bottom-8 left-20 w-72 h-72 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" })] })), _jsx("div", { className: performanceMode ? "hero card" : "hero glass", children: _jsx("div", { className: "hero-inner flex items-center justify-between gap-3", children: _jsxs("div", { children: [_jsx("div", { className: "inline-flex items-center gap-2 rounded-full px-3 py-1 bg-yellow-100 text-xs font-semibold text-black border border-yellow-300", children: _jsxs(Badge, { variant: "warning", className: "mb-3", children: [_jsx("span", { className: performanceMode ? "" : "animate-pulse" }), _jsx("span", { children: "On-Demand Services" })] }) }), _jsx("h1", { className: "text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent transform hover:scale-105 transition-transform cursor-default", children: "CleanCloak" }), _jsx("p", { className: "text-gray-700 text-base sm:text-lg mb-4", children: "Professional car detailing services" })] }) }) }), _jsx("div", { className: performanceMode ? "card p-4" : "card p-4 glass", children: _jsx(Booking, {}) })] }));
}
