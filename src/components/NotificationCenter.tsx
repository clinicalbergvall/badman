import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  useNotifications,
  type Notification,
} from "@/contexts/NotificationContext";

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
    toastMuted,
    toggleToastMute,
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleHardwareBack = (e: Event) => {
      if (isOpen) {
        setIsOpen(false);
        if (e.cancelable) e.preventDefault();
      }
    };
    document.addEventListener("app:hardwareBack", handleHardwareBack as EventListener);
    return () => {
      document.removeEventListener("app:hardwareBack", handleHardwareBack as EventListener);
    };
  }, [isOpen]);

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);

    // Navigate based on notification type
    if (notification.bookingId) {
      if (notification.type === "service_complete") {
        navigate("/completed-bookings");
      } else {
        // Could navigate to booking details
        navigate("/");
      }
    }

    setIsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "service_complete":
        return "✅";
      case "payment_success":
        return "💳";
      case "cleaner_accepted":
        return "👍";
      case "cleaner_on_way":
        return "🚗";
      default:
        return "ℹ️";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "service_complete":
        return "bg-green-500";
      case "payment_success":
        return "bg-blue-500";
      case "cleaner_accepted":
        return "bg-yellow-500";
      case "cleaner_on_way":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 rounded-xl transition-all duration-300 hover:scale-110
                 bg-white/40 dark:bg-gray-800/50 hover:bg-white/60 dark:hover:bg-gray-700/70
                 backdrop-blur-md shadow-lg"
        title="Notifications"
      >
        <div className="text-xl">🔔</div>

        {/* Badge */}
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold
                       rounded-full w-5 h-5 flex items-center justify-center
                       animate-pulse shadow-lg"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="fixed right-4 top-20 w-80 sm:w-96 max-h-[500px] overflow-hidden
                      bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200
                      dark:border-gray-700 z-[9999] animate-scale-in"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              🔔 Notifications
              {unreadCount > 0 && (
                <span className="text-sm bg-yellow-500 text-white px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h3>
            {notifications.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  title="Mark all as read"
                >
                  ✓✓
                </button>
                <button
                  onClick={clearAll}
                  className="text-sm text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                  title="Clear all"
                >
                  🗑️
                </button>
                <button
                  onClick={toggleToastMute}
                  className="text-sm text-gray-600 dark:text-gray-300 hover:underline flex items-center gap-1"
                  title={toastMuted ? "Unmute toast" : "Mute toast"}
                >
                  {toastMuted ? "🔕" : "🔔"}
                </button>
              </div>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-2 text-5xl">🔔</div>
                <p className="text-gray-500 dark:text-gray-400">
                  No notifications yet
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  You'll be notified about your bookings here
                </p>
              </div>
            ) : (
              <div>
                {notifications.map((notification: Notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 border-b border-gray-100 dark:border-gray-700
                              hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer
                              transition-colors ${!notification.read ? "bg-blue-50 dark:bg-blue-900/10" : ""}`}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full ${getNotificationColor(notification.type)}
                                    flex items-center justify-center text-white text-lg`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            className={`text-sm font-semibold ${
                              notification.read
                                ? "text-gray-700 dark:text-gray-300"
                                : "text-gray-900 dark:text-white"
                            }`}
                          >
                            {notification.title}
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearNotification(notification.id);
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors text-lg"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            {formatTime(notification.createdAt)}
                          </span>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
