import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
export function RatingInterface({ onSubmit, disabled = false, currentRating, currentReview }) {
    const [rating, setRating] = useState(currentRating || 0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [review, setReview] = useState(currentReview || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = async () => {
        if (rating === 0)
            return;
        setIsSubmitting(true);
        try {
            await onSubmit(rating, review);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const stars = [1, 2, 3, 4, 5];
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-col items-center gap-3", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "How was your service?" }), _jsx("div", { className: "flex gap-2", children: stars.map((star) => {
                            const isFilled = star <= (hoveredRating || rating);
                            return (_jsx("button", { type: "button", disabled: disabled, onClick: () => !disabled && setRating(star), onMouseEnter: () => !disabled && setHoveredRating(star), onMouseLeave: () => !disabled && setHoveredRating(0), className: `
                  transition-all duration-200 transform
                  ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'}
                `, "aria-label": `${star} star${star !== 1 ? 's' : ''}`, children: _jsx("svg", { className: `w-10 h-10 md:w-12 md:h-12 transition-colors duration-200 ${isFilled
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'fill-none text-gray-300 dark:text-gray-600 stroke-current'}`, viewBox: "0 0 20 20", strokeWidth: "1", children: _jsx("path", { d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" }) }) }, star));
                        }) }), rating > 0 && (_jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: [rating === 1 && '😞 Poor', rating === 2 && '😕 Fair', rating === 3 && '😊 Good', rating === 4 && '😄 Very Good', rating === 5 && '⭐ Excellent!'] }))] }), rating > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "review", className: "block text-sm font-medium text-gray-700 dark:text-gray-300", children: "Share your experience (optional)" }), _jsx("textarea", { id: "review", rows: 4, disabled: disabled, value: review, onChange: (e) => setReview(e.target.value), placeholder: "Tell us about your experience...", maxLength: 500, className: "w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg \n                     focus:ring-2 focus:ring-yellow-500 focus:border-transparent\n                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white\n                     placeholder-gray-400 dark:placeholder-gray-500\n                     disabled:opacity-50 disabled:cursor-not-allowed\n                     resize-none" }), _jsx("div", { className: "flex justify-between items-center", children: _jsxs("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: [review.length, "/500 characters"] }) })] })), rating > 0 && !disabled && (_jsx("button", { onClick: handleSubmit, disabled: isSubmitting, className: "w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold \n                   py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg\n                   disabled:opacity-50 disabled:cursor-not-allowed\n                   flex items-center justify-center gap-2", children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-white" }), "Submitting..."] })) : ('Submit Rating') }))] }));
}
