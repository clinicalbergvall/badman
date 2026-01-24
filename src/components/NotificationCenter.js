import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications, } from "@/contexts/NotificationContext";
export function NotificationCenter() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification, clearAll, toastMuted, toggleToastMute, } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current &&
                !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isOpen]);
    useEffect(() => {
        const handleHardwareBack = (e) => {
            if (isOpen) {
                setIsOpen(false);
                if (e.cancelable)
                    e.preventDefault();
            }
        };
        document.addEventListener("app:hardwareBack", handleHardwareBack);
        return () => {
            document.removeEventListener("app:hardwareBack", handleHardwareBack);
        };
    }, [isOpen]);
    const handleNotificationClick = (notification) => {
        markAsRead(notification.id);
        if (notification.bookingId) {
            if (notification.type === "service_complete" || notification.type === "booking_completed") {
                navigate("/completed-bookings");
            }
            else {
                navigate(`/active-booking/${notification.bookingId}`);
            }
        }
        setIsOpen(false);
    };
    const getNotificationIcon = (type) => {
        switch (type) {
            case "service_complete":
            case "booking_completed":
                return "✅";
            case "payment_success":
            case "payment_completed":
                return "💳";
            case "cleaner_accepted":
            case "booking_accepted":
                return "👍";
            case "cleaner_on_way":
            case "cleaner_status_update":
                return "🚗";
            case "new_message":
            case "newMessage":
                return "💬";
            case "payout_processed":
                return "💰";
            case "booking_created":
                return "📋";
            default:
                return "ℹ️";
        }
    };
    const getNotificationColor = (type) => {
        switch (type) {
            case "service_complete":
            case "booking_completed":
                return "bg-green-500";
            case "payment_success":
            case "payment_completed":
                return "bg-blue-500";
            case "cleaner_accepted":
            case "booking_accepted":
                return "bg-yellow-500";
            case "cleaner_on_way":
            case "cleaner_status_update":
                return "bg-purple-500";
            case "new_message":
            case "newMessage":
                return "bg-indigo-500";
            case "payout_processed":
                return "bg-emerald-500";
            case "booking_created":
                return "bg-cyan-500";
            default:
                return "bg-gray-500";
        }
    };
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 1)
            return "Just now";
        if (diffMins < 60)
            return `${diffMins}m ago`;
        if (diffHours < 24)
            return `${diffHours}h ago`;
        if (diffDays < 7)
            return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };
    return (_jsxs("div", { className: "relative", ref: dropdownRef, children: [_jsxs("button", { onClick: () => setIsOpen(!isOpen), className: "relative p-3 rounded-xl transition-all duration-300 hover:scale-110\n                 bg-white/40 dark:bg-gray-800/50 hover:bg-white/60 dark:hover:bg-gray-700/70\n                 backdrop-blur-md shadow-lg", title: "Notifications", children: [_jsx("div", { className: "text-xl", children: "\uD83D\uDD14" }), unreadCount > 0 && (_jsx("span", { className: "absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold\n                       rounded-full w-5 h-5 flex items-center justify-center\n                       animate-pulse shadow-lg", children: unreadCount > 9 ? "9+" : unreadCount }))] }), isOpen && (_jsxs("div", { className: "fixed right-4 top-16 w-80 sm:w-96 max-h-[500px] overflow-hidden\n                      bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200\n                      dark:border-gray-700 z-[9999] animate-scale-in", style: { transform: 'translateY(0)', top: 'calc(100% + 8px)' }, children: [_jsxs("div", { className: "p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between", children: [_jsxs("h3", { className: "text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2", children: ["\uD83D\uDD14 Notifications", unreadCount > 0 && (_jsx("span", { className: "text-sm bg-yellow-500 text-white px-2 py-0.5 rounded-full", children: unreadCount }))] }), notifications.length > 0 && (_jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: markAllAsRead, className: "text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1", title: "Mark all as read", children: "\u2713\u2713" }), _jsx("button", { onClick: clearAll, className: "text-sm text-red-600 dark:text-red-400 hover:underline flex items-center gap-1", title: "Clear all", children: "\uD83D\uDDD1\uFE0F" }), _jsx("button", { onClick: toggleToastMute, className: "text-sm text-gray-600 dark:text-gray-300 hover:underline flex items-center gap-1", title: toastMuted ? "Unmute toast" : "Mute toast", children: toastMuted ? "🔕" : "🔔" })] }))] }), _jsx("div", { className: "max-h-[400px] overflow-y-auto", children: notifications.length === 0 ? (_jsxs("div", { className: "p-8 text-center", children: [_jsx("div", { className: "text-gray-400 mb-2 text-5xl", children: "\uD83D\uDD14" }), _jsx("p", { className: "text-gray-500 dark:text-gray-400", children: "No notifications yet" }), _jsx("p", { className: "text-sm text-gray-400 dark:text-gray-500 mt-1", children: "You'll be notified about your bookings here" })] })) : (_jsx("div", { children: notifications.map((notification) => (_jsx("div", { onClick: () => handleNotificationClick(notification), className: `p-4 border-b border-gray-100 dark:border-gray-700
                              hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer
                              transition-colors ${!notification.read ? "bg-blue-50 dark:bg-blue-900/10" : ""}`, children: _jsxs("div", { className: "flex gap-3", children: [_jsx("div", { className: `flex-shrink-0 w-10 h-10 rounded-full ${getNotificationColor(notification.type)}
                                    flex items-center justify-center text-white text-lg`, children: getNotificationIcon(notification.type) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsx("h4", { className: `text-sm font-semibold ${notification.read
                                                                ? "text-gray-700 dark:text-gray-300"
                                                                : "text-gray-900 dark:text-white"}`, children: notification.title }), _jsx("button", { onClick: (e) => {
                                                                e.stopPropagation();
                                                                clearNotification(notification.id);
                                                            }, className: "text-gray-400 hover:text-red-500 transition-colors text-lg", children: "\u2715" })] }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1", children: notification.message }), _jsxs("div", { className: "flex items-center gap-2 mt-2", children: [_jsx("span", { className: "text-xs text-gray-500 dark:text-gray-500", children: formatTime(notification.createdAt) }), !notification.read && (_jsx("span", { className: "w-2 h-2 bg-blue-500 rounded-full" }))] })] })] }) }, notification.id))) })) })] }))] }));
}
