import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Badge, Button, ChatComponent } from "@/components/ui";
import { PaymentModal } from "@/components/PaymentModal";
import toast from "react-hot-toast";
import { loadUserSession } from "@/lib/storage";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getVehicleCategory, getCarServicePackage, CLEANING_CATEGORIES, ROOM_SIZES, } from "@/lib/validation";
import { api } from "@/lib/api";
import { logger } from "@/lib/logger";
function RatingModal({ isOpen, onClose, onSubmit, bookingId, serviceName, }) {
    const [rating, setRating] = useState(0);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [review, setReview] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    if (!isOpen)
        return null;
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0)
            return;
        setIsSubmitting(true);
        try {
            await onSubmit(rating, review);
            onClose();
        }
        catch (error) {
            logger.error("Failed to submit rating:", error instanceof Error ? error : undefined);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleClose = () => {
        setRating(0);
        setReview("");
        setHoveredStar(0);
        onClose();
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-xl w-full p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Rate Your Service" }), _jsx("button", { onClick: handleClose, className: "text-gray-400 hover:text-gray-600", children: _jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { children: [_jsxs("p", { className: "text-sm text-gray-600 mb-2", children: ["Service: ", serviceName] }), _jsxs("p", { className: "text-xs text-gray-500", children: ["Booking ID: ", bookingId] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-3", children: "How would you rate this service?" }), _jsx("div", { className: "flex gap-2 justify-center", children: [1, 2, 3, 4, 5].map((star) => (_jsx("button", { type: "button", onClick: () => setRating(star), onMouseEnter: () => setHoveredStar(star), onMouseLeave: () => setHoveredStar(0), className: "transition-transform hover:scale-110", children: _jsx("svg", { className: `w-10 h-10 ${star <= (hoveredStar || rating)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "fill-gray-200 text-gray-200"}`, viewBox: "0 0 20 20", children: _jsx("path", { d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" }) }) }, star))) }), rating > 0 && (_jsxs("p", { className: "text-center text-sm text-gray-600 mt-2", children: [rating === 1 && "Poor", rating === 2 && "Fair", rating === 3 && "Good", rating === 4 && "Very Good", rating === 5 && "Excellent"] }))] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "review", className: "block text-sm font-medium text-gray-700 mb-2", children: "Share your experience (optional)" }), _jsx("textarea", { id: "review", value: review, onChange: (e) => setReview(e.target.value), rows: 4, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 resize-none", placeholder: "Tell us about your experience with this service..." })] }), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx(Button, { type: "button", variant: "outline", onClick: handleClose, className: "flex-1", disabled: isSubmitting, children: "Cancel" }), _jsx(Button, { type: "submit", className: "flex-1", disabled: rating === 0 || isSubmitting, children: isSubmitting ? "Submitting..." : "Submit Rating" })] })] })] }) }));
}
export default function BookingHistory() {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [selectedChatBooking, setSelectedChatBooking] = useState(null);
    const [userSession, setUserSession] = useState(loadUserSession());
    const [ratingModalOpen, setRatingModalOpen] = useState(false);
    const [selectedBookingForRating, setSelectedBookingForRating] = useState(null);
    const [selectedBookingForPayment, setSelectedBookingForPayment] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isMarkingComplete, setIsMarkingComplete] = useState(false);
    const fetchBookings = async (showLoading = true) => {
        if (showLoading)
            setIsLoading(true);
        try {
            const response = await api.get("/bookings");
            if (response.ok) {
                const data = await response.json();
                if (data.success && Array.isArray(data.bookings)) {
                    const mappedBookings = data.bookings.map((b) => ({
                        ...b,
                        id: b._id,
                    }));
                    setHistory(mappedBookings);
                }
            }
            else {
                logger.error("Failed to fetch bookings from API");
            }
        }
        catch (error) {
            logger.error("Error fetching bookings:", error instanceof Error ? error : undefined);
        }
        finally {
            if (showLoading)
                setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchBookings();
        const interval = setInterval(() => {
            fetchBookings(false);
        }, 15000);
        return () => clearInterval(interval);
    }, []);
    const filteredHistory = (filter === "all"
        ? history
        : history.filter((item) => {
            if (filter === 'confirmed') {
                return item.status === 'confirmed' || item.status === 'in-progress';
            }
            return item.status === filter;
        }))
        .filter((item) => item.status !== "cancelled")
        .filter((item) => item.serviceCategory !== "home-cleaning");
    const getStatusBadge = (status) => {
        const variants = {
            pending: "warning",
            confirmed: "default",
            "in-progress": "warning",
            completed: "success",
        };
        return _jsx(Badge, { variant: variants[status], children: status.toUpperCase() });
    };
    const handleRateBooking = (booking) => {
        setSelectedBookingForRating(booking);
        setRatingModalOpen(true);
    };
    const handleRatingSubmit = async (rating, review) => {
        if (!selectedBookingForRating)
            return;
        if (!rating || rating < 1 || rating > 5) {
            alert("Please select a valid rating between 1 and 5 stars");
            return;
        }
        if (review && review.length > 1000) {
            alert("Review must be less than 1000 characters");
            return;
        }
        try {
            setHistory((prev) => prev.map((item) => item.id === selectedBookingForRating.id
                ? { ...item, rating, review }
                : item));
            const response = await api.post(`/bookings/${selectedBookingForRating.id}/rating`, { rating, review });
            if (!response.ok) {
                const error = await response.json();
                logger.error("Failed to submit rating to backend:", error);
                if (error.message === "Booking has already been rated") {
                    alert("You have already rated this booking");
                }
                else if (error.message === "Can only rate completed bookings") {
                    alert("You can only rate completed bookings");
                }
                else {
                    alert("Failed to submit rating. Please try again.");
                }
                setHistory((prev) => prev.map((item) => item.id === selectedBookingForRating.id
                    ? { ...item, rating: undefined, review: undefined }
                    : item));
            }
            else {
            }
        }
        catch (error) {
            logger.error("Error submitting rating:", error instanceof Error ? error : undefined);
            alert("Network error. Please check your connection.");
            setHistory((prev) => prev.map((item) => item.id === selectedBookingForRating.id
                ? { ...item, rating: undefined, review: undefined }
                : item));
        }
    };
    const handleMarkComplete = async (booking) => {
        if (!window.confirm("Mark this job as completed? The client will be notified to pay within 2 hours.")) {
            return;
        }
        setIsMarkingComplete(true);
        try {
            const response = await api.post(`/bookings/${booking.id}/complete`, {
                notes: "Job completed successfully",
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to mark as complete");
            }
            toast.success("✅ Job marked as completed! Client has 2 hours to pay.");
            setHistory((prev) => prev.map((item) => item.id === booking.id
                ? { ...item, status: "completed" }
                : item));
        }
        catch (error) {
            logger.error("Error marking complete:", error instanceof Error ? error : undefined);
            toast.error(error instanceof Error ? error.message : "Failed to mark as complete");
        }
        finally {
            setIsMarkingComplete(false);
        }
    };
    const handlePayNow = async (booking) => {
        if (!booking.rating) {
            toast.error("⭐ Please rate the service before paying");
            handleRateBooking(booking);
            return;
        }
        setSelectedBookingForPayment(booking);
        setShowPaymentModal(true);
    };
    const handlePaymentSuccess = () => {
        fetchBookings();
        toast.success("Payment completed successfully!");
    };
    // const _handlePaymentCancel = () => {
    //   setShowPaymentModal(false);
    //   setSelectedBookingForPayment(null);
    //   toast.error("Payment cancelled");
    // };
    return (_jsxs("div", { className: "min-h-screen bg-gray-50 py-8 px-0 overflow-x-hidden", children: [_jsx("style", { children: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      ` }), _jsxs("div", { className: "w-full", children: [_jsxs("div", { className: "mb-8 w-full px-0", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 w-full px-0", children: [_jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("button", { onClick: () => window.history.back(), className: "text-gray-600 hover:text-gray-900 flex items-center gap-1", children: _jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }) }), _jsx("h1", { className: "text-3xl font-bold text-gray-900 truncate", children: "My Bookings" })] }), _jsx("p", { className: "text-gray-600 mt-1 truncate", children: "Track and manage your service history" })] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => fetchBookings(true), className: "flex items-center gap-2 flex-shrink-0", children: [_jsx("svg", { className: isLoading ? "animate-spin w-4 h-4" : "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" }) }), _jsx("span", { children: "Refresh" })] })] }), _jsx("div", { className: "flex gap-2 overflow-x-auto pb-2 border-b hide-scrollbar w-full px-0", children: ['all', 'pending', 'confirmed', 'completed'].map((status) => (_jsx("button", { onClick: () => setFilter(status), className: `px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 flex-shrink-0 ${filter === status
                                        ? 'border-yellow-400 text-gray-900'
                                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'}`, children: status.charAt(0).toUpperCase() +
                                        status.slice(1).replace('-', ' ') }, status))) })] }), filteredHistory.length === 0 ? (_jsxs("div", { className: "bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12 text-center", children: [_jsx("div", { className: "w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx("svg", { className: "w-10 h-10 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }) }) }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-1", children: "No bookings found" }), _jsx("p", { className: "text-sm text-gray-600", children: "Your booking history will appear here" })] })) : (_jsx("div", { className: "grid gap-4 w-full px-0", children: filteredHistory.map((booking) => {
                            const isCarService = booking.serviceCategory === "car-detailing";
                            const vType = isCarService ? booking.vehicleType : undefined;
                            const vehicleOrProperty = vType ? getVehicleCategory(vType) : undefined;
                            const sPkg = isCarService ? booking.carServicePackage : undefined;
                            const servicePackageName = sPkg
                                ? getCarServicePackage(sPkg)?.name
                                : CLEANING_CATEGORIES.find((c) => c.id === booking.cleaningCategory)?.name || "Home Cleaning";
                            const typeName = (() => {
                                if (isCarService) {
                                    return vehicleOrProperty?.name;
                                }
                                if (!booking.cleaningCategory)
                                    return undefined;
                                if (booking.cleaningCategory === "HOUSE_CLEANING") {
                                    if (booking.houseCleaningType === "BATHROOM")
                                        return "Bathroom Cleaning";
                                    if (booking.houseCleaningType === "WINDOW")
                                        return "Window Cleaning";
                                    if (booking.houseCleaningType === "ROOM" && booking.roomSize) {
                                        const size = ROOM_SIZES.find((r) => r.id === booking.roomSize);
                                        return size?.name || "Room";
                                    }
                                }
                                if (booking.cleaningCategory === "FUMIGATION" && booking.roomSize) {
                                    const size = ROOM_SIZES.find((r) => r.id === booking.roomSize);
                                    return `${booking.fumigationType === "BED_BUG" ? "Bed Bug" : "General"} · ${size?.name || ""}`.trim();
                                }
                                if (booking.cleaningCategory === "MOVE_IN_OUT" && booking.roomSize) {
                                    const size = ROOM_SIZES.find((r) => r.id === booking.roomSize);
                                    return `Move In/Out · ${size?.name || ""}`.trim();
                                }
                                if (booking.cleaningCategory === "POST_CONSTRUCTION" && booking.roomSize) {
                                    const size = ROOM_SIZES.find((r) => r.id === booking.roomSize);
                                    return `Post Construction · ${size?.name || ""}`.trim();
                                }
                                return undefined;
                            })();
                            return (_jsxs("div", { className: "bg-white shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer w-full overflow-hidden", onClick: () => setSelectedBooking(booking), children: [_jsxs("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3 w-full min-w-0 overflow-hidden px-0", children: [_jsxs("div", { className: "flex items-start gap-3 min-w-0 overflow-hidden", children: [_jsx("div", { className: "w-10 h-10 bg-yellow-100 flex items-center justify-center text-xl flex-shrink-0", children: vehicleOrProperty?.icon }), _jsxs("div", { className: "flex-1 min-w-0 overflow-hidden", children: [_jsx("h3", { className: "font-semibold text-gray-900 text-base truncate", children: servicePackageName }), _jsx("p", { className: "text-sm text-gray-600 truncate", children: typeName }), _jsxs("p", { className: "text-xs text-gray-500 mt-1 truncate", children: ["Booked: ", formatDate(new Date(booking.createdAt))] })] })] }), _jsxs("div", { className: "flex flex-col items-end justify-center min-w-[80px] flex-shrink-0", children: [getStatusBadge(booking.status), _jsx("p", { className: "text-base font-bold text-gray-900 mt-1 truncate", children: formatCurrency(booking.price) })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600 pt-3 border-t w-full overflow-hidden", children: [booking.scheduledDate && (_jsxs("div", { className: "flex items-center gap-1 min-w-0", children: [_jsx("svg", { className: "w-3 h-3 flex-shrink-0 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 003 2z" }) }), _jsx("span", { className: "truncate", children: booking.scheduledDate })] })), _jsxs("div", { className: "flex items-center gap-1 min-w-0", children: [_jsx("svg", { className: "w-3 h-3 flex-shrink-0 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" }) }), _jsx("span", { className: "truncate uppercase", children: booking.paymentMethod })] }), booking.location && (_jsxs("div", { className: "flex items-center gap-1 min-w-0", children: [_jsxs("svg", { className: "w-3 h-3 flex-shrink-0 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M15 11a3 3 0 11-6 0 3 3 0 016 0z" })] }), _jsx("span", { className: "truncate", children: booking.location.manualAddress ||
                                                            booking.location.address ||
                                                            "Location provided" })] }))] }), _jsxs("div", { className: "mt-3 pt-3 border-t space-y-2 w-full overflow-hidden", children: [(booking.status === "confirmed" ||
                                                booking.status === "in-progress") && (_jsxs(Button, { variant: "outline", size: "xs", onClick: (e) => {
                                                    e.stopPropagation();
                                                    setSelectedChatBooking(booking);
                                                }, className: "w-full flex items-center justify-center gap-1 text-sm", children: [_jsx("span", { children: "\uD83D\uDCAC" }), _jsx("span", { className: "truncate", children: "Chat" })] })), booking.status === "completed" && !booking.paid && (_jsxs(Button, { variant: "primary", size: "xs", onClick: (e) => {
                                                    e.stopPropagation();
                                                    setSelectedBookingForPayment(booking);
                                                    setShowPaymentModal(true);
                                                }, className: "w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 flex items-center justify-center gap-1 text-sm", children: [_jsx("span", { children: "\uD83D\uDCB0" }), _jsxs("span", { className: "truncate", children: ["Pay (", formatCurrency(booking.price), ")"] })] })), booking.rating ? (_jsxs("div", { className: "flex items-center gap-1 justify-center py-1", children: [_jsx("span", { className: "text-xs text-gray-600 mr-1", children: "Rating:" }), Array.from({ length: 5 }).map((_, i) => (_jsx("svg", { className: `w-4 h-4 ${booking.rating && i < booking.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`, viewBox: "0 0 20 20", children: _jsx("path", { d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" }) }, i)))] })) : (booking.status === "completed" && booking.paid && (_jsxs(Button, { variant: "outline", size: "xs", onClick: (e) => {
                                                    e.stopPropagation();
                                                    setSelectedBookingForRating(booking);
                                                    setRatingModalOpen(true);
                                                }, className: "w-full flex items-center justify-center gap-1 text-sm", children: [_jsx("span", { children: "\u2B50" }), _jsx("span", { className: "truncate", children: "Rate" })] })))] })] }, booking.id));
                        }) })), selectedBooking && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", onClick: () => setSelectedBooking(null), children: _jsxs("div", { className: "bg-white rounded-2xl shadow-xl max-w-md w-full p-6", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Booking Details" }), _jsx("button", { onClick: () => setSelectedBooking(null), className: "text-gray-400 hover:text-gray-600", children: _jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Service" }), _jsx("p", { className: "font-semibold text-gray-900", children: (() => {
                                                        const isCarService = selectedBooking.serviceCategory === "car-detailing";
                                                        const servicePackage = selectedBooking.carServicePackage ? getCarServicePackage(selectedBooking.carServicePackage) : undefined;
                                                        const vehicleCategory = selectedBooking.vehicleType ? getVehicleCategory(selectedBooking.vehicleType) : undefined;
                                                        const serviceTitle = isCarService
                                                            ? `${servicePackage?.name || "Car Detailing"} - ${vehicleCategory?.name || "Vehicle"}`
                                                            : CLEANING_CATEGORIES.find((c) => c.id === selectedBooking.cleaningCategory)?.name || "Cleaning Service";
                                                        return serviceTitle;
                                                    })() })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Type" }), _jsx("p", { className: "font-semibold text-gray-900", children: selectedBooking.serviceCategory === "car-detailing" && selectedBooking.vehicleType
                                                        ? getVehicleCategory(selectedBooking.vehicleType)?.name
                                                        : (() => {
                                                            if (selectedBooking.cleaningCategory === "HOUSE_CLEANING") {
                                                                if (selectedBooking.houseCleaningType === "BATHROOM")
                                                                    return "Bathroom Cleaning";
                                                                if (selectedBooking.houseCleaningType === "WINDOW")
                                                                    return "Window Cleaning";
                                                                if (selectedBooking.houseCleaningType === "ROOM") {
                                                                    const size = selectedBooking.roomSize ? ROOM_SIZES.find((r) => r.id === selectedBooking.roomSize) : undefined;
                                                                    return size?.name || "Room";
                                                                }
                                                            }
                                                            if (selectedBooking.cleaningCategory === "FUMIGATION") {
                                                                const size = selectedBooking.roomSize ? ROOM_SIZES.find((r) => r.id === selectedBooking.roomSize) : undefined;
                                                                return `${selectedBooking.fumigationType === "BED_BUG" ? "Bed Bug" : "General"} · ${size?.name || ""}`.trim();
                                                            }
                                                            if (selectedBooking.cleaningCategory === "MOVE_IN_OUT") {
                                                                const size = selectedBooking.roomSize ? ROOM_SIZES.find((r) => r.id === selectedBooking.roomSize) : undefined;
                                                                return `Move In/Out · ${size?.name || ""}`.trim();
                                                            }
                                                            if (selectedBooking.cleaningCategory === "POST_CONSTRUCTION") {
                                                                const size = selectedBooking.roomSize ? ROOM_SIZES.find((r) => r.id === selectedBooking.roomSize) : undefined;
                                                                return `Post Construction · ${size?.name || ""}`.trim();
                                                            }
                                                            return "";
                                                        })() })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Status" }), getStatusBadge(selectedBooking.status)] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Price" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: formatCurrency(selectedBooking.price) })] }), selectedBooking.location && (_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Location" }), _jsx("p", { className: "font-medium text-gray-900", children: selectedBooking.location.manualAddress ||
                                                        selectedBooking.location.address })] })), _jsx("div", { className: "pt-4 border-t", children: _jsx(Button, { fullWidth: true, onClick: () => setSelectedBooking(null), children: "Close" }) })] })] }) })), selectedChatBooking && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "bg-white rounded-lg max-w-2xl w-full max-h-[80vh]", children: [_jsxs("div", { className: "p-4 border-b flex items-center justify-between", children: [_jsxs("h3", { className: "text-lg font-semibold", children: ["Chat with Cleaner -", " ", selectedChatBooking.serviceCategory === "car-detailing" && selectedChatBooking.carServicePackage
                                                    ? getCarServicePackage(selectedChatBooking.carServicePackage)?.name || "Car Service"
                                                    : CLEANING_CATEGORIES.find((c) => c.id === selectedChatBooking.cleaningCategory)?.name || "Cleaning Service"] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setSelectedChatBooking(null), children: "\u2715" })] }), _jsx("div", { className: "p-4", children: _jsx(ChatComponent, { bookingId: selectedChatBooking.id, currentUserId: userSession?.phone || "", currentUserRole: "client" }) })] }) })), _jsx(RatingModal, { isOpen: ratingModalOpen, onClose: () => {
                            setRatingModalOpen(false);
                            setSelectedBookingForRating(null);
                        }, onSubmit: handleRatingSubmit, bookingId: selectedBookingForRating?.id || "", serviceName: selectedBookingForRating?.serviceCategory === "car-detailing"
                            ? getCarServicePackage(selectedBookingForRating?.carServicePackage || "NORMAL-DETAIL")
                                ?.name || "Car Service"
                            : CLEANING_CATEGORIES.find((c) => c.id === selectedBookingForRating?.cleaningCategory)?.name || "Cleaning Service" }), showPaymentModal && selectedBookingForPayment && (_jsx(PaymentModal, { isOpen: showPaymentModal, onClose: () => {
                            setShowPaymentModal(false);
                            setSelectedBookingForPayment(null);
                        }, bookingId: selectedBookingForPayment.id, amount: selectedBookingForPayment.price, onSuccess: handlePaymentSuccess }))] })] }));
}
