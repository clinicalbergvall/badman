import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function ProgressBar({ value, max = 100, showLabel, className = '' }) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    return (_jsxs("div", { className: `w-full ${className}`, children: [_jsx("div", { className: "h-4 w-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 rounded-full overflow-hidden shadow-inner border border-gray-200", children: _jsx("div", { className: "h-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-full transition-all duration-700 ease-out shadow-md hover:shadow-lg", style: { width: `${percentage}%` } }) }), showLabel && (_jsxs("p", { className: "mt-1 text-xs text-gray-600 text-right", children: [Math.round(percentage), "%"] }))] }));
}
