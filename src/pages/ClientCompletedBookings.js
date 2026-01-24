import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Button, Card, Badge } from "@/components/ui";
import { PaymentModal } from "@/components/PaymentModal";
import RatingModal from "@/components/RatingModal";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";
import { logger } from "@/lib/logger";
import { api } from "@/lib/api";
import { loadUserSession } from "@/lib/storage";
export default function ClientCompletedBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentBooking, setPaymentBooking] = useState(null);
    useEffect(() => {
        fetchCompletedBookings();
    }, []);
    const fetchCompletedBookings = async () => {
        try {
            setLoading(true);
            const response = await api.get("/bookings");
            if (!response.ok) {
                throw new Error("Failed to fetch bookings");
            }
            const data = await response.json();
            const completedBookings = data.bookings?.filter((booking) => booking.status === "completed") || [];
            setBookings(completedBookings);
        }
        catch (error) {
            logger.error("Fetch completed bookings error:", error instanceof Error ? error : undefined);
            toast.error("Failed to load bookings");
        }
        finally {
            setLoading(false);
        }
    };
    const handleRateService = (booking) => {
        setSelectedBooking(booking);
        setShowRatingModal(true);
    };
    const handleSubmitRating = async (rating, review) => {
        if (!selectedBooking)
            return;
        try {
            const response = await api.post(`/bookings/${selectedBooking._id}/rating`, { rating, review });
            if (!response.ok) {
                throw new Error("Failed to submit rating");
            }
            toast.success("Rating submitted successfully! ⭐");
            await fetchCompletedBookings();
            setShowRatingModal(false);
            setSelectedBooking(null);
        }
        catch (error) {
            logger.error("Submit rating error:", error instanceof Error ? error : undefined);
            toast.error("Failed to submit rating");
            throw error;
        }
    };
    const handlePayNow = async (booking) => {
        if (!booking.rating) {
            toast.error("Please rate the service before making payment");
            handleRateService(booking);
            return;
        }
        if (booking.paid) {
            toast.error("This booking has already been paid");
            return;
        }
        setPaymentBooking(booking);
        setShowPaymentModal(true);
    };
    const handlePaymentSuccess = async () => {
        toast.success("Payment successful! 🎉");
        setShowPaymentModal(false);
        setPaymentBooking(null);
        await fetchCompletedBookings();
    };
    const handlePaymentClose = () => {
        setShowPaymentModal(false);
        setPaymentBooking(null);
    };
    const getTimeRemaining = (deadline) => {
        if (!deadline)
            return null;
        const now = new Date().getTime();
        const deadlineTime = new Date(deadline).getTime();
        const remaining = deadlineTime - now;
        if (remaining <= 0) {
            return { text: "Overdue", isOverdue: true };
        }
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 0) {
            return { text: `${hours}h ${minutes}m remaining`, isOverdue: false };
        }
        return { text: `${minutes}m remaining`, isOverdue: false };
    };
    const getServiceTitle = (booking) => {
        if (booking.serviceCategory === "car-detailing") {
            return `${booking.carServicePackage || "Car Detailing"} - ${booking.vehicleType || "Vehicle"}`;
        }
        return `${booking.cleaningCategory || "Car Detailing"}`;
    };
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 p-4 md:p-6", children: _jsx("div", { className: "max-w-4xl mx-auto", children: _jsx("div", { className: "flex items-center justify-center min-h-[60vh]", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" }), _jsx("p", { className: "text-gray-600 font-medium", children: "Loading your bookings..." })] }) }) }) }));
    }
    const session = loadUserSession();
    if (!session) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 p-4 md:p-6", children: _jsx("div", { className: "max-w-4xl mx-auto", children: _jsx("div", { className: "flex items-center justify-center min-h-[60vh]", children: _jsxs(Card, { className: "p-12 text-center max-w-md mx-auto", children: [_jsx("div", { className: "w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx("svg", { className: "w-10 h-10 text-green-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }), _jsx("h3", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Login Required" }), _jsx("p", { className: "text-gray-600 mb-6", children: "Please login to view your completed bookings and payments" }), _jsxs("div", { className: "space-y-3", children: [_jsx(Button, { variant: "primary", onClick: () => (window.location.href = "/test-login"), className: "w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700", children: "Login / Register" }), _jsx(Button, { variant: "outline", onClick: () => (window.location.href = "/"), className: "w-full", children: "Go to Home" })] })] }) }) }) }));
    }
    const unpaidBookings = bookings.filter((b) => !b.paid);
    const paidBookings = bookings.filter((b) => b.paid);
    return (_jsxs("div", { className: "min-h-screen bg-gray-50 p-4 md:p-6", children: [_jsxs("div", { className: "max-w-4xl mx-auto space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-2", children: "Completed Services" }), _jsx("p", { className: "text-gray-600", children: "Rate your experience and make payment" })] }), _jsxs(Button, { variant: "outline", onClick: () => window.history.back(), className: "flex items-center gap-2", children: [_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }), "Back"] })] }), unpaidBookings.length > 0 && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Awaiting Payment" }), _jsx(Badge, { variant: "warning", className: "animate-pulse", children: unpaidBookings.length })] }), unpaidBookings.map((booking) => {
                                const timeRemaining = getTimeRemaining(booking.paymentDeadline);
                                return (_jsx(Card, { className: "p-6 hover:shadow-lg transition-shadow", children: _jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: getServiceTitle(booking) }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Cleaner: ", booking.cleaner?.name || "N/A"] })] }), timeRemaining && (_jsx(Badge, { variant: timeRemaining.isOverdue ? "error" : "warning", className: timeRemaining.isOverdue ? "animate-pulse" : "", children: timeRemaining.text }))] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mt-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500", children: "Completed" }), _jsx("p", { className: "text-sm font-medium text-gray-900", children: new Date(booking.completedAt).toLocaleDateString("en-US", {
                                                                            month: "short",
                                                                            day: "numeric",
                                                                            hour: "2-digit",
                                                                            minute: "2-digit",
                                                                        }) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500", children: "Amount" }), _jsx("p", { className: "text-lg font-bold text-yellow-600", children: formatCurrency(booking.price) })] })] }), booking.rating && (_jsxs("div", { className: "mt-3 flex items-center gap-2", children: [_jsx("div", { className: "flex items-center", children: [1, 2, 3, 4, 5].map((star) => (_jsx("svg", { className: `w-4 h-4 ${star <= booking.rating
                                                                        ? "text-yellow-400 fill-current"
                                                                        : "text-gray-300"}`, fill: star <= booking.rating
                                                                        ? "currentColor"
                                                                        : "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" }) }, star))) }), _jsx(Badge, { variant: "success", children: "Rated" })] }))] }), _jsx("div", { className: "flex flex-col gap-2 md:w-48", children: _jsx(Button, { variant: "primary", onClick: () => handlePayNow(booking), className: "w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700", children: "\uD83D\uDCB3 Pay Now" }) })] }) }, booking._id));
                            })] })), paidBookings.length > 0 && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Payment History" }), _jsx(Badge, { variant: "success", children: paidBookings.length })] }), paidBookings.map((booking) => (_jsx(Card, { className: "p-6 opacity-75", children: _jsx("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4", children: _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: getServiceTitle(booking) }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Cleaner: ", booking.cleaner?.name || "N/A"] })] }), _jsx(Badge, { variant: "success", children: "\u2713 Paid" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mt-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500", children: "Paid On" }), _jsx("p", { className: "text-sm font-medium text-gray-900", children: booking.paidAt
                                                                    ? new Date(booking.paidAt).toLocaleDateString("en-US", {
                                                                        month: "short",
                                                                        day: "numeric",
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                    })
                                                                    : "N/A" })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500", children: "Amount" }), _jsx("p", { className: "text-lg font-bold text-green-600", children: formatCurrency(booking.price) })] })] }), booking.rating && (_jsxs("div", { className: "mt-3 flex items-center gap-2", children: [_jsx("div", { className: "flex items-center", children: [1, 2, 3, 4, 5].map((star) => (_jsx("svg", { className: `w-4 h-4 ${star <= booking.rating
                                                                ? "text-yellow-400 fill-current"
                                                                : "text-gray-300"}`, fill: star <= booking.rating
                                                                ? "currentColor"
                                                                : "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" }) }, star))) }), booking.review && (_jsxs("p", { className: "text-sm text-gray-600 ml-2 line-clamp-1", children: ["\"", booking.review, "\""] }))] }))] }) }) }, booking._id)))] })), bookings.length === 0 && (_jsxs(Card, { className: "p-12 text-center", children: [_jsx("div", { className: "w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx("svg", { className: "w-10 h-10 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }) }) }), _jsx("h3", { className: "text-xl font-semibold text-gray-900 mb-2", children: "No Completed Bookings" }), _jsx("p", { className: "text-gray-600 mb-6", children: "Your completed services will appear here" }), _jsx(Button, { variant: "primary", onClick: () => (window.location.href = "/"), className: "bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700", children: "Book a Service" })] }))] }), selectedBooking && (_jsx(RatingModal, { isOpen: showRatingModal, onClose: () => {
                    setShowRatingModal(false);
                    setSelectedBooking(null);
                }, onSubmit: handleSubmitRating, bookingId: selectedBooking._id, cleanerName: selectedBooking.cleaner?.name, serviceType: getServiceTitle(selectedBooking) })), paymentBooking && (_jsx(PaymentModal, { isOpen: showPaymentModal, onClose: handlePaymentClose, bookingId: paymentBooking._id, amount: paymentBooking.price, onSuccess: handlePaymentSuccess }))] }));
}
