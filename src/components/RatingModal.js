import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button, Card } from '@/components/ui';
export default function RatingModal({ isOpen, onClose, onSubmit, bookingId, cleanerName = 'Cleaner', serviceType = 'Service', }) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [review, setReview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    if (!isOpen)
        return null;
    const handleSubmit = async () => {
        if (rating === 0) {
            alert('Please select a rating');
            return;
        }
        setIsSubmitting(true);
        try {
            await onSubmit(rating, review);
            setRating(0);
            setReview('');
            onClose();
        }
        catch (error) {
            console.error('Rating submission error:', error);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const ratingLabels = [
        'Poor',
        'Fair',
        'Good',
        'Very Good',
        'Excellent',
    ];
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fadeIn", children: _jsxs(Card, { className: "w-full bg-white rounded-2xl shadow-2xl p-6 animate-up", children: [_jsxs("div", { className: "text-center mb-6", children: [_jsx("div", { className: "w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3", children: _jsx("svg", { className: "w-8 h-8 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" }) }) }), _jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-1", children: "Rate Your Experience" }), _jsxs("p", { className: "text-sm text-gray-600", children: ["How was your ", serviceType, " with ", cleanerName, "?"] })] }), _jsxs("div", { className: "mb-6", children: [_jsx("div", { className: "flex justify-center gap-2 mb-2", children: [1, 2, 3, 4, 5].map((star) => (_jsx("button", { type: "button", onClick: () => setRating(star), onMouseEnter: () => setHoveredRating(star), onMouseLeave: () => setHoveredRating(0), className: "transition-transform hover:scale-110 focus:outline-none", "aria-label": `Rate ${star} stars`, children: _jsx("svg", { className: `w-12 h-12 transition-colors ${star <= (hoveredRating || rating)
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'}`, fill: star <= (hoveredRating || rating) ? 'currentColor' : 'none', stroke: "currentColor", strokeWidth: 1.5, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" }) }) }, star))) }), rating > 0 && (_jsx("p", { className: "text-center text-sm font-medium text-yellow-600 animate-up", children: ratingLabels[rating - 1] }))] }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { htmlFor: "review", className: "block text-sm font-medium text-gray-700 mb-2", children: "Share your feedback (optional)" }), _jsx("textarea", { id: "review", rows: 4, value: review, onChange: (e) => setReview(e.target.value), className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none", placeholder: "Tell us about your experience...", maxLength: 500 }), _jsxs("p", { className: "text-xs text-gray-500 mt-1 text-right", children: [review.length, "/500 characters"] })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { variant: "outline", onClick: onClose, disabled: isSubmitting, className: "flex-1", children: "Cancel" }), _jsx(Button, { variant: "primary", onClick: handleSubmit, disabled: isSubmitting || rating === 0, className: "flex-1 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700", children: isSubmitting ? (_jsxs("div", { className: "flex items-center justify-center gap-2", children: [_jsx("div", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" }), _jsx("span", { children: "Submitting..." })] })) : ('Submit Rating') })] }), _jsx("p", { className: "text-xs text-gray-500 text-center mt-4", children: "\u2B50 Rating is required before you can make payment" })] }) }));
}
