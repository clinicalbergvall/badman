import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useNotifications } from "../contexts/NotificationContext";
import { RatingInterface } from "@/components/RatingInterface";
import { PaymentModal } from "@/components/PaymentModal";
import { PaymentReceipt } from "@/components/PaymentReceipt";
export default function CompletedBookings() {
    const navigate = useNavigate();
    const { addNotification } = useNotifications();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [ratingBookingId, setRatingBookingId] = useState(null);
    useEffect(() => {
        fetchCompletedBookings();
    }, []);
    const fetchCompletedBookings = async () => {
        setLoading(true);
        try {
            const response = await api.get("/bookings");
            if (!response.ok) {
                throw new Error("Failed to fetch bookings");
            }
            const data = await response.json();
            const completed = data.bookings?.filter((b) => b.status === "completed") || [];
            setBookings(completed);
        }
        catch (error) {
            console.error("Error fetching bookings:", error);
            toast.error("Failed to load completed bookings");
        }
        finally {
            setLoading(false);
        }
    };
    const handleSubmitRating = async (bookingId, rating, review) => {
        try {
            const response = await api.post(`/bookings/${bookingId}/rating`, { rating, review });
            if (!response.ok) {
                throw new Error("Failed to submit rating");
            }
            toast.success("Rating submitted successfully!");
            setRatingBookingId(null);
            setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, rating, review } : b)));
        }
        catch (error) {
            console.error("Error submitting rating:", error);
            toast.error("Failed to submit rating");
            throw error;
        }
    };
    const handlePayNow = (booking) => {
        setSelectedBooking(booking);
        setShowPaymentModal(true);
    };
    const handlePaymentSuccess = () => {
        setShowPaymentModal(false);
        setShowReceipt(true);
        toast.success("Payment successful!");
        if (selectedBooking) {
            addNotification({
                type: "payment_success",
                title: "Payment Successful! 💳",
                message: `Your payment of KSh ${selectedBooking.price.toLocaleString()} has been processed successfully.`,
                bookingId: selectedBooking.id,
            });
        }
        fetchCompletedBookings();
    };
    const calculateTimeRemaining = (deadline) => {
        if (!deadline)
            return null;
        const now = new Date().getTime();
        const deadlineTime = new Date(deadline).getTime();
        const diff = deadlineTime - now;
        if (diff <= 0)
            return "Overdue";
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 0) {
            return `${hours}h ${minutes}m remaining`;
        }
        return `${minutes}m remaining`;
    };
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-500 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "Loading completed bookings..." })] }) }));
    }
    const unpaidBookings = bookings.filter((b) => !b.paid);
    const paidBookings = bookings.filter((b) => b.paid);
    return (_jsxs("div", { className: "min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 dark:text-white mb-2", children: "Completed Services" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "Review and pay for your completed services" })] }), unpaidBookings.length > 0 && (_jsxs("div", { className: "mb-8", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2", children: ["\u26A0\uFE0F Pending Payment (", unpaidBookings.length, ")"] }), _jsx("div", { className: "space-y-4", children: unpaidBookings.map((booking) => (_jsx(BookingCard, { booking: booking, onRate: () => setRatingBookingId(booking.id), onPay: () => handlePayNow(booking), isRating: ratingBookingId === booking.id, onSubmitRating: handleSubmitRating, timeRemaining: calculateTimeRemaining(booking.paymentDeadline) }, booking.id))) })] })), paidBookings.length > 0 && (_jsxs("div", { children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 dark:text-white mb-4", children: ["Paid Services (", paidBookings.length, ")"] }), _jsx("div", { className: "space-y-4", children: paidBookings.map((booking) => (_jsx(BookingCard, { booking: booking, isPaid: true }, booking.id))) })] })), bookings.length === 0 && (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "text-gray-400 mb-4", children: _jsx("svg", { className: "w-16 h-16 mx-auto", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }), _jsx("h3", { className: "text-xl font-semibold text-gray-900 dark:text-white mb-2", children: "No Completed Services Yet" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400 mb-6", children: "Your completed services will appear here" }), _jsx("button", { onClick: () => navigate("/"), className: "bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition", children: "Book a Service" })] }))] }), showPaymentModal && selectedBooking && (_jsx(PaymentModal, { isOpen: true, onClose: () => setShowPaymentModal(false), bookingId: selectedBooking.id, amount: selectedBooking.price, onSuccess: handlePaymentSuccess })), showReceipt && selectedBooking && (_jsx(PaymentReceipt, { booking: selectedBooking, onClose: () => {
                    setShowReceipt(false);
                    setSelectedBooking(null);
                } }))] }));
}
function BookingCard({ booking, onPay, isPaid, isRating, onSubmitRating, timeRemaining, }) {
    const formatDate = (dateString) => {
        if (!dateString)
            return "N/A";
        return new Date(dateString).toLocaleDateString("en-KE", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };
    const hasRating = booking.rating && booking.rating > 0;
    const canPay = hasRating && !isPaid;
    return (_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700", children: [_jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white capitalize", children: booking.serviceCategory?.replace("-", " ") }), _jsxs("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: ["Completed ", formatDate(booking.completedAt)] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "text-2xl font-bold text-yellow-600 dark:text-yellow-500", children: ["KSh ", booking.price.toLocaleString()] }), isPaid && (_jsx("span", { className: "inline-block mt-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-semibold rounded-full", children: "\u2713 Paid" }))] })] }), _jsxs("div", { className: "space-y-2 mb-4", children: [booking.location?.address && (_jsxs("div", { className: "flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400", children: ["\uD83D\uDCCD ", _jsx("span", { children: booking.location.address })] })), booking.scheduledDate && (_jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400", children: ["\uD83D\uDCC5", " ", _jsxs("span", { children: [booking.scheduledDate, " ", booking.scheduledTime && `at ${booking.scheduledTime}`] })] }))] }), !isPaid && timeRemaining && (_jsxs("div", { className: `mb-4 p-3 rounded-lg flex items-center gap-2 ${timeRemaining === "Overdue"
                    ? "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300"
                    : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300"}`, children: ["\u23F0", " ", _jsx("span", { className: "text-sm font-medium", children: timeRemaining === "Overdue"
                            ? "Payment overdue!"
                            : `Payment due: ${timeRemaining}` })] })), hasRating ? (_jsxs("div", { className: "mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: ["\u2B50", " ", _jsxs("span", { className: "font-semibold text-gray-900 dark:text-white", children: ["Your Rating: ", booking.rating, "/5"] })] }), booking.review && (_jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-400 italic", children: ["\"", booking.review, "\""] }))] })) : isRating && onSubmitRating ? (_jsx("div", { className: "mb-4", children: _jsx(RatingInterface, { onSubmit: (rating, review) => onSubmitRating(booking.id, rating, review) }) })) : null, !isPaid && (_jsx("div", { className: "flex gap-3", children: canPay && (_jsx("button", { onClick: onPay, className: "flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold\n                       py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg\n                       flex items-center justify-center gap-2", children: "\uD83D\uDCB3 Pay Now" })) }))] }));
}
