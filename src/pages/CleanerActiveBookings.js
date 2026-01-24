import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { loadUserSession } from "@/lib/storage";
import { api } from "@/lib/api";
import { useNotifications } from "../contexts/NotificationContext";
import { CompleteJobModal } from '@/components/CompleteJobModal';
import { Button, ChatComponent } from '@/components/ui';
import CleanerLayout from "@/components/CleanerLayout";
import { getVehicleCategory } from "@/lib/validation";
import { calculateCleanerPayout } from "@/lib/utils";
export default function CleanerActiveBookings() {
    const navigate = useNavigate();
    const { addNotification } = useNotifications();
    const [activeBookings, setActiveBookings] = useState([]);
    const [completedBookings, setCompletedBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [selectedChatBooking, setSelectedChatBooking] = useState(null);
    const ChatWithCurrentUser = ({ bookingId }) => {
        const userSession = loadUserSession();
        if (!userSession) {
            return _jsx("div", { className: "p-4 text-center text-gray-500", children: "Please log in to use chat" });
        }
        return (_jsx(ChatComponent, { bookingId: bookingId, currentUserId: userSession.phone, currentUserRole: "cleaner" }));
    };
    const fetchBookings = async (showLoading = true) => {
        if (showLoading)
            setLoading(true);
        try {
            const response = await api.get("/bookings");
            if (!response.ok) {
                if (response.status === 401) {
                    toast.error("Session expired. Please sign in again.");
                    navigate("/test-login");
                    return;
                }
                throw new Error("Failed to fetch bookings");
            }
            const data = await response.json();
            const allBookings = data.bookings || [];
            const active = allBookings.filter((b) => b.status === "confirmed" || b.status === "in-progress");
            const completed = allBookings.filter((b) => b.status === "completed");
            setActiveBookings(active);
            setCompletedBookings(completed);
        }
        catch (error) {
            console.error("Error fetching bookings:", error);
            toast.error("Failed to load bookings");
        }
        finally {
            if (showLoading)
                setLoading(false);
        }
    };
    useEffect(() => {
        fetchBookings();
        const interval = setInterval(() => {
            fetchBookings(false);
        }, 30000);
        return () => clearInterval(interval);
    }, []);
    const handleCompleteJob = (booking) => {
        setSelectedBooking(booking);
        setShowCompleteModal(true);
    };
    const handleConfirmComplete = async () => {
        if (!selectedBooking)
            return;
        try {
            // Update booking status to completed using the status endpoint
            const response = await api.put(`/bookings/${selectedBooking._id || selectedBooking.id}/status`, { status: 'completed' });
            if (!response.ok) {
                if (response.status === 401) {
                    toast.error("Session expired. Please sign in again.");
                    navigate("/test-login");
                    return;
                }
                throw new Error("Failed to complete booking");
            }
            await response.json();
            toast.success("Job marked as complete! Client will be notified.");
            addNotification({
                type: "service_complete",
                title: "Job Completed! ✅",
                message: `${selectedBooking.serviceCategory} job completed. Awaiting client payment for payout.`,
                bookingId: selectedBooking._id || selectedBooking.id,
            });
            setShowCompleteModal(false);
            setSelectedBooking(null);
            fetchBookings();
        }
        catch (error) {
            console.error("Error completing booking:", error);
            toast.error("Failed to mark job as complete");
            throw error;
        }
    };
    const handleStartChat = (booking) => {
        setSelectedChatBooking(booking);
    };
    const handleGetDirections = (booking) => {
        if (booking.location && booking.location.coordinates) {
            const [lat, lng] = booking.location.coordinates;
            // Open Google Maps with directions
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
        }
        else if (booking.location && (booking.location.address || booking.location.manualAddress)) {
            const address = booking.location.manualAddress || booking.location.address;
            // Open Google Maps with the address
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || '')}`, '_blank');
        }
    };
    if (loading) {
        return (_jsx(CleanerLayout, { children: _jsx("div", { className: "min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-500 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "Loading bookings..." })] }) }) }));
    }
    return (_jsx(CleanerLayout, { children: _jsxs("div", { className: "min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 dark:text-white mb-2", children: "My Active Jobs" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "Manage your ongoing and completed jobs" })] }), activeBookings.length > 0 && (_jsxs("div", { className: "mb-8", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2", children: ["\uD83E\uDDF9 Active Jobs (", activeBookings.length, ")"] }), _jsx("div", { className: "space-y-4", children: activeBookings.map((booking) => (_jsx(ActiveBookingCard, { booking: booking, onComplete: () => handleCompleteJob(booking), onNavigate: () => navigate(`/bookings/${booking._id || booking.id}`), onStartChat: handleStartChat, onGetDirections: handleGetDirections }, booking._id || booking.id))) })] })), completedBookings.length > 0 && (_jsxs("div", { className: "mb-8", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2", children: ["\u2705 Completed - Awaiting Payment (", completedBookings.length, ")"] }), _jsx("div", { className: "space-y-4", children: completedBookings.map((booking) => (_jsx(CompletedBookingCard, { booking: booking }, booking._id || booking.id))) })] })), activeBookings.length === 0 && completedBookings.length === 0 && (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "text-gray-400 mb-4 text-6xl", children: "\u23F3" }), _jsx("h3", { className: "text-xl font-semibold text-gray-900 dark:text-white mb-2", children: "No Active Jobs" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400 mb-6", children: "Check the Jobs page for new opportunities" }), _jsx("button", { onClick: () => navigate("/jobs"), className: "bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition", children: "Browse Jobs" })] }))] }), showCompleteModal && selectedBooking && (_jsx(CompleteJobModal, { booking: {
                        id: selectedBooking._id || selectedBooking.id,
                        serviceCategory: selectedBooking.serviceCategory,
                        price: selectedBooking.price,
                    }, onConfirm: handleConfirmComplete, onCancel: () => {
                        setShowCompleteModal(false);
                        setSelectedBooking(null);
                    } })), selectedChatBooking && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "bg-white rounded-lg max-w-2xl w-full max-h-[80vh]", children: [_jsxs("div", { className: "p-4 border-b flex items-center justify-between", children: [_jsxs("h3", { className: "text-lg font-semibold", children: ["Chat with Client -", " ", selectedChatBooking.serviceCategory === "car-detailing"
                                                ? selectedChatBooking.carServicePackage || "Car Service"
                                                : selectedChatBooking.cleaningCategory || "Cleaning Service"] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setSelectedChatBooking(null), children: "\u2715" })] }), _jsx("div", { className: "p-4", children: _jsx(ChatWithCurrentUser, { bookingId: selectedChatBooking._id || selectedChatBooking.id || "" }) })] }) }))] }) }));
}
function ActiveBookingCard({ booking, onComplete, onStartChat, onGetDirections }) {
    const formatDate = (dateString) => {
        if (!dateString)
            return "N/A";
        return new Date(dateString).toLocaleDateString("en-KE", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };
    const cleanerPayout = calculateCleanerPayout(booking.price);
    return (_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4", children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-xl flex items-center justify-center text-2xl flex-shrink-0", children: booking.vehicleType ? getVehicleCategory(booking.vehicleType)?.icon || "🚗" : "🚗" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white capitalize", children: booking.serviceCategory?.replace("-", " ") }), _jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400 capitalize", children: booking.bookingType })] })] }), _jsxs("div", { className: "flex flex-col items-end", children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Your Earnings" }), _jsxs("p", { className: "text-2xl font-bold text-yellow-600 dark:text-yellow-500", children: ["KSh ", cleanerPayout.toLocaleString()] })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4", children: [(booking.location?.address || booking.location?.manualAddress) && (_jsxs("div", { className: "flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400", children: [_jsx("span", { className: "flex-shrink-0", children: "\uD83D\uDCCD" }), _jsx("span", { className: "truncate", children: booking.location.manualAddress || booking.location.address })] })), booking.scheduledDate && (_jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400", children: [_jsx("span", { className: "flex-shrink-0", children: "\uD83D\uDCC5" }), _jsxs("span", { children: [formatDate(booking.scheduledDate), " ", booking.scheduledTime && `at ${booking.scheduledTime}`] })] }))] }), _jsxs("div", { className: "bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4", children: [_jsx("h4", { className: "text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2", children: "Client Information" }), _jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx("span", { className: "flex-shrink-0", children: "\uD83D\uDC64" }), _jsx("span", { className: "text-gray-900 dark:text-white", children: booking.client.name })] }), _jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx("span", { className: "flex-shrink-0", children: "\uD83D\uDCDE" }), _jsx("a", { href: `tel:${booking.client.phone}`, className: "text-blue-600 dark:text-blue-400 hover:underline", children: booking.client.phone })] })] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3", children: [_jsx("span", { className: "inline-block px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-sm font-semibold rounded-full capitalize self-start", children: booking.status === 'in-progress' ? 'Confirmed' : booking.status.replace("-", " ") }), _jsxs("div", { className: "flex gap-2", children: [(booking.status === "confirmed" || booking.status === "in-progress") && (_jsx("button", { onClick: (e) => {
                                    e.stopPropagation();
                                    onStartChat(booking);
                                }, className: "bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg\n                       transition duration-200 shadow-md hover:shadow-lg flex items-center gap-2", children: "\uD83D\uDCAC Chat" })), booking.location && (_jsx("button", { onClick: (e) => {
                                    e.stopPropagation();
                                    onGetDirections(booking);
                                }, className: "bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg\n                       transition duration-200 shadow-md hover:shadow-lg flex items-center gap-2", children: "\uD83E\uDDED Get Directions" })), _jsx("button", { onClick: onComplete, className: "bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg\n                     transition duration-200 shadow-md hover:shadow-lg flex items-center gap-2", children: "\u2705 Mark Complete" })] })] })] }));
}
function CompletedBookingCard({ booking }) {
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
    const cleanerPayout = calculateCleanerPayout(booking.price);
    const isPaid = booking.paid || booking.paymentStatus === "paid";
    const payoutProcessed = booking.payoutStatus === "completed";
    return (_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4", children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center text-2xl flex-shrink-0", children: "\u2705" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white capitalize", children: booking.serviceCategory?.replace("-", " ") }), _jsxs("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: ["Completed ", formatDate(booking.completedAt)] })] })] }), _jsxs("div", { className: "flex flex-col items-end", children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Your Earnings" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: ["KSh ", cleanerPayout.toLocaleString()] })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg", children: [_jsx("span", { className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: "Payment Status" }), _jsx("span", { className: `inline-block px-3 py-1 text-sm font-semibold rounded-full ${isPaid
                                    ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                    : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"}`, children: isPaid ? "✓ Paid" : "⏳ Awaiting Payment" })] }), isPaid && (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg", children: [_jsx("span", { className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: "Payout Status" }), _jsx("span", { className: `inline-block px-3 py-1 text-sm font-semibold rounded-full ${payoutProcessed
                                    ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                    : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"}`, children: payoutProcessed ? "💰 Payout Sent" : "🔄 Processing" })] }))] }), isPaid && booking.paidAt && (_jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400 text-center mt-3", children: ["Paid on ", formatDate(booking.paidAt)] }))] }));
}
