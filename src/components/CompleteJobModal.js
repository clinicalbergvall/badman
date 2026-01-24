import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
export function CompleteJobModal({ booking, onConfirm, onCancel }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await onConfirm();
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const cleanerPayout = Math.round(booking.price * 0.4);
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full", children: [_jsx("div", { className: "p-6 border-b border-gray-200 dark:border-gray-700", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2", children: "\u2705 Complete Job?" }), _jsx("button", { onClick: onCancel, className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl", children: "\u2715" })] }) }), _jsxs("div", { className: "p-6 space-y-4", children: [_jsxs("div", { className: "bg-gray-50 dark:bg-gray-700 rounded-lg p-4", children: [_jsx("h3", { className: "font-semibold text-gray-900 dark:text-white capitalize mb-2", children: booking.serviceCategory?.replace('-', ' ') }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-gray-500 dark:text-gray-400", children: "Your Earnings" }), _jsxs("p", { className: "text-2xl font-bold text-green-600 dark:text-green-500", children: ["KSh ", cleanerPayout.toLocaleString()] })] })] }), _jsx("div", { className: "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4", children: _jsx("p", { className: "text-sm text-blue-800 dark:text-blue-300", children: "\u2139\uFE0F Client will be notified to review and pay within 2 hours. Your payout will be sent automatically after payment." }) })] }), _jsxs("div", { className: "p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3", children: [_jsx("button", { onClick: onCancel, disabled: isSubmitting, className: "flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 \n                     dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold \n                     rounded-lg transition duration-200 disabled:opacity-50", children: "Cancel" }), _jsx("button", { onClick: handleSubmit, disabled: isSubmitting, className: "flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold \n                     rounded-lg transition duration-200 shadow-md hover:shadow-lg\n                     disabled:opacity-50 disabled:cursor-not-allowed\n                     flex items-center justify-center gap-2", children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-white" }), "Completing..."] })) : (_jsx(_Fragment, { children: "\u2705 Mark Complete" })) })] })] }) }));
}
