import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
const { useState, useEffect } = React;
const ErrorBoundary = ({ children, fallback, onError }) => {
    const [hasError, setHasError] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        // Reset error state when children change
        setHasError(false);
        setError(null);
    }, [children]);
    if (hasError && error) {
        if (fallback) {
            return fallback;
        }
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center px-4", children: _jsxs("div", { className: "w-full bg-white rounded-lg shadow-lg p-6 text-center", children: [_jsx("div", { className: "w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx("svg", { className: "w-8 h-8 text-red-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" }) }) }), _jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-2", children: "Something went wrong" }), _jsx("p", { className: "text-gray-600 mb-4", children: "We encountered an unexpected error. Please try refreshing the page." }), _jsxs("div", { className: "space-y-2", children: [_jsx("button", { onClick: () => window.location.reload(), className: "w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors", children: "Refresh Page" }), _jsx("button", { onClick: () => {
                                    setHasError(false);
                                    setError(null);
                                }, className: "w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors", children: "Try Again" })] })] }) }));
    }
    return _jsx(_Fragment, { children: children });
};
export default ErrorBoundary;
