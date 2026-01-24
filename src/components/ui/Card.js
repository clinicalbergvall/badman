import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
// Workaround for React import issues
const forwardRef = React.forwardRef;
export const Card = forwardRef(({ variant = 'default', hoverable, selected, className = '', children, ...props }, ref) => {
    const baseStyles = 'rounded-2xl transition-all';
    const variants = {
        default: 'bg-gradient-to-br from-gray-50 to-white border border-gray-200',
        elevated: 'bg-gradient-to-br from-white to-gray-50 shadow-lg border border-yellow-200',
        outlined: 'bg-gradient-to-br from-white to-gray-50 border-2 border-yellow-300',
        glass: 'backdrop-blur-xl bg-white/80 border border-white/20 shadow-xl'
    };
    const hoverStyles = hoverable ? 'hover:shadow-lg hover:border-yellow-300 hover:scale-[1.02] cursor-pointer transition-transform duration-200' : '';
    const selectedStyles = selected ? 'border-yellow-400 ring-2 ring-yellow-400/40 bg-yellow-50' : '';
    return (_jsx("div", { ref: ref, className: `${baseStyles} ${variants[variant]} ${hoverStyles} ${selectedStyles} ${className}`, ...props, children: children }));
});
Card.displayName = 'Card';
