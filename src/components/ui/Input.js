import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
// Workaround for React import issues
const forwardRef = React.forwardRef;
const InputHTMLAttributes = null;
import { nanoid } from 'nanoid';
export const Input = forwardRef(({ label, error, helperText, icon, className = '', id, ...props }, ref) => {
    const generatedId = id || nanoid();
    return (_jsxs("div", { className: "w-full", children: [label && (_jsx("label", { htmlFor: generatedId, className: "block text-sm font-semibold text-gray-700 mb-1.5", children: label })), _jsxs("div", { className: "relative", children: [icon && (_jsx("div", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400", children: icon })), _jsx("input", { id: generatedId, ref: ref, className: `
              w-full rounded-xl border-2 px-4 py-3 text-base shadow-sm
              ${icon ? 'pl-11' : ''}
              ${error ? 'border-red-400 focus:ring-red-500 bg-red-50' : 'border-gray-200 focus:ring-yellow-400 focus:border-yellow-400 bg-white hover:border-gray-300'}
              focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent
              disabled:bg-gray-50 disabled:cursor-not-allowed
              transition-all duration-300
              ${className}
            `, ...props })] }), error && (_jsxs("p", { className: "mt-1.5 text-sm text-red-600 flex items-center gap-1", children: [_jsx("svg", { className: "w-4 h-4", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z", clipRule: "evenodd" }) }), error] })), helperText && !error && (_jsx("p", { className: "mt-1.5 text-sm text-gray-500", children: helperText }))] }));
});
Input.displayName = 'Input';
