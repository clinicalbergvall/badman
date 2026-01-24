import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect, useRef } from 'react';
// Workaround for React import issues
const { forwardRef } = React;
import toast from "react-hot-toast";
import { Card } from "./Card";
import { authAPI, api } from "@/lib/api";
import { API_BASE_URL } from "@/lib/config";
export const Button = forwardRef(({ variant = "primary", size = "md", fullWidth, loading, className = "", children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5";
    const variants = {
        primary: "bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-300 hover:to-yellow-400 shadow-lg hover:shadow-xl",
        secondary: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 shadow-lg hover:shadow-xl",
        outline: "border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-lg hover:shadow-xl",
        ghost: "text-gray-600 hover:bg-gray-100 hover:shadow-md",
        destructive: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl",
    };
    const sizes = {
        xs: "px-2 py-1 text-xs",
        sm: "px-3 py-2 text-xs",
        md: "px-4 py-2.5 text-sm",
        lg: "px-6 py-3 text-base",
    };
    return (_jsx("button", { ref: ref, className: `${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`, disabled: disabled || loading, ...props, children: loading ? (_jsxs(_Fragment, { children: [_jsxs("svg", { className: "animate-spin -ml-1 mr-2 h-4 w-4", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), "Loading..."] })) : (children) }));
});
Button.displayName = "Button";
export const ImageCarousel = ({ images, interval = 4000, }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    useEffect(() => {
        const timer = setInterval(() => {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
                setIsAnimating(false);
            }, 300);
        }, interval);
        return () => clearInterval(timer);
    }, [images.length, interval]);
    return (_jsxs("div", { className: "relative w-full h-64 overflow-hidden rounded-lg shadow-sm border border-gray-200", children: [_jsx("div", { className: "relative w-full h-full", children: images.map((image, index) => (_jsxs("div", { className: `absolute inset-0 transition-all duration-700 ease-in-out transform ${index === currentIndex
                        ? "translate-x-0 opacity-100 scale-100"
                        : index === (currentIndex - 1 + images.length) % images.length
                            ? "-translate-x-full opacity-0 scale-95"
                            : "translate-x-full opacity-0 scale-95"}`, children: [_jsx("img", { src: image.image, alt: image.title, className: "w-full h-full object-cover", onError: (e) => {
                                const target = e.target;
                                target.style.display = "none";
                                target.parentElement.style.background =
                                    "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)";
                            } }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" }), _jsxs("div", { className: "absolute bottom-0 left-0 right-0 p-4 text-white", children: [_jsx("h3", { className: "font-bold text-lg mb-1", children: image.title }), _jsx("p", { className: "text-sm opacity-90", children: image.description })] })] }, image.id))) }), _jsx("div", { className: "absolute bottom-4 right-4 flex gap-2", children: images.map((_, index) => (_jsx("button", { onClick: () => {
                        setIsAnimating(true);
                        setTimeout(() => {
                            setCurrentIndex(index);
                            setIsAnimating(false);
                        }, 300);
                    }, className: `h-2 rounded-full transition-all duration-300 ${index === currentIndex
                        ? "bg-yellow-400 w-8"
                        : "bg-white/60 hover:bg-white/80"}` }, index))) }), _jsx("button", { onClick: () => {
                    setIsAnimating(true);
                    setTimeout(() => {
                        setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
                        setIsAnimating(false);
                    }, 300);
                }, className: "absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-lg transition-all shadow-sm border border-gray-200", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }) }), _jsx("button", { onClick: () => {
                    setIsAnimating(true);
                    setTimeout(() => {
                        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
                        setIsAnimating(false);
                    }, 300);
                }, className: "absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-lg transition-all shadow-sm border border-gray-200", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }) })] }));
};
export const LoginForm = ({ onAuthSuccess, }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [apiStatus, setApiStatus] = useState(null);
    const [formData, setFormData] = useState({
        phone: "",
        password: "",
        name: "",
        role: "cleaner",
    });
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = isLogin
                ? await authAPI.login(formData.identifier, formData.password)
                : await authAPI.register(formData);
            if (data.success && data.user) {
                localStorage.setItem("detailpro-user-session", JSON.stringify({
                    userType: data.user.role,
                    name: data.user.name,
                    phone: data.user.phone,
                    lastSignedIn: new Date().toISOString(),
                }));
                toast.success(data.message);
                onAuthSuccess(data.user);
            }
            else {
                if (data.errors) {
                    data.errors.forEach((error) => toast.error(error.msg));
                }
                else {
                    toast.error(data.message || "Authentication failed");
                }
            }
        }
        catch (error) {
            const errorMessage = error?.message || "Network error. Please try again.";
            toast.error(errorMessage);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        api.get('/health', { signal: controller.signal })
            .then((r) => setApiStatus({ ok: r.ok, base: API_BASE_URL }))
            .catch(() => setApiStatus({ ok: false, base: API_BASE_URL }))
            .finally(() => clearTimeout(timeout));
    }, []);
    return (_jsx("div", { className: "min-h-screen flex items-start justify-center bg-gray-50 pt-8 pb-24 px-4 sm:px-6 lg:px-8 overflow-y-auto", children: _jsxs("div", { className: "max-w-md w-full space-y-8", children: [_jsx("div", { children: _jsx("h2", { className: "mt-6 text-center text-3xl font-extrabold text-gray-900", children: isLogin ? "Sign in to your account" : "Create your account" }) }), _jsxs(Card, { className: "p-8", children: [apiStatus && (_jsxs("div", { className: "mb-4 flex items-center gap-2", children: [_jsx("div", { className: `w-3 h-3 rounded-full ${apiStatus.ok ? 'bg-green-500 animate-pulse' : 'bg-red-500'}` }), _jsx("span", { className: `text-sm font-medium ${apiStatus.ok ? 'text-green-700' : 'text-red-700'}`, children: apiStatus.ok ? 'Connected' : 'Connection issue' })] })), _jsxs("form", { className: "space-y-6", onSubmit: handleSubmit, children: [!isLogin && (_jsx(_Fragment, { children: _jsxs("div", { children: [_jsx("label", { htmlFor: "name", className: "block text-sm font-medium text-gray-700", children: "Full Name" }), _jsx("input", { id: "name", name: "name", type: "text", required: true, value: isLogin ? "" : formData.name, onChange: handleInputChange, className: "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" })] }) })), _jsxs("div", { children: [_jsx("label", { htmlFor: "phone", className: "block text-sm font-medium text-gray-700", children: isLogin ? "Phone Number" : "Phone Number (Kenyan)" }), _jsx("input", { id: "phone", name: isLogin ? "identifier" : "phone", type: "tel", pattern: isLogin ? undefined : "0[17]\\d{8}", placeholder: isLogin
                                                ? "07XXXXXXXX or 01XXXXXXXX"
                                                : "07XXXXXXXX or 01XXXXXXXX", required: true, value: isLogin
                                                ? formData.identifier || ""
                                                : formData.phone || "", onChange: handleInputChange, className: "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700", children: "Password" }), _jsx("input", { id: "password", name: "password", type: "password", required: true, minLength: 6, value: formData.password, onChange: handleInputChange, className: "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" })] }), _jsx("div", { children: _jsx(Button, { type: "submit", disabled: loading, loading: loading, className: "w-full", children: isLogin ? "Sign In" : "Sign Up" }) }), _jsx("div", { className: "text-center", children: _jsx("button", { type: "button", onClick: () => setIsLogin(!isLogin), className: "text-blue-600 hover:text-blue-500 text-sm", children: isLogin
                                            ? "Don't have an account? Sign up"
                                            : "Already have an account? Sign in" }) })] })] })] }) }));
};
export const ChatComponent = ({ bookingId, currentUserId, currentUserRole, }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [chatRoom, setChatRoom] = useState(null);
    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    useEffect(() => {
        fetchChatRoom();
        const interval = setInterval(fetchChatRoom, 5000);
        return () => clearInterval(interval);
    }, [bookingId]);
    useEffect(() => {
        if (!chatRoom)
            return;
        try {
            const OVERRIDE_API_URL = localStorage.getItem('apiOverride') || '';
            const VITE_API_URL = import.meta.env.VITE_API_URL;
            const base = OVERRIDE_API_URL || VITE_API_URL || window.location.origin;
            const apiUrl = base.endsWith('/api') ? base : `${base}/api`;
            const url = `${apiUrl}/events`;
            const es = new EventSource(url, { withCredentials: true });
            es.addEventListener('message', (evt) => {
                try {
                    const payload = JSON.parse(evt.data);
                    const { type, message: newMessage } = payload || {};
                    if (type === 'newMessage' && newMessage && newMessage.bookingId === bookingId &&
                        !messages.some((msg) => msg.id === newMessage.id)) {
                        setMessages((prev) => [...prev, newMessage]);
                    }
                }
                catch (e) {
                    console.error('Error processing SSE message:', e);
                }
            });
            es.addEventListener('newMessage', (evt) => {
                try {
                    const payload = JSON.parse(evt.data);
                    const { message: newMessage } = payload || {};
                    if (newMessage && newMessage.bookingId === bookingId &&
                        !messages.some((msg) => msg.id === newMessage.id)) {
                        setMessages((prev) => [...prev, newMessage]);
                    }
                }
                catch (e) {
                    console.error('Error processing SSE message:', e);
                }
            });
            es.addEventListener('error', (evt) => {
                console.error('SSE connection error:', evt);
            });
            return () => {
                es.close();
            };
        }
        catch (e) {
            console.error('Failed to setup SSE for chat:', e);
        }
    }, [bookingId, chatRoom, messages]);
    const fetchChatRoom = async () => {
        try {
            const response = await api.get(`/chat/${bookingId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setChatRoom(data.chatRoom);
                    if (data.chatRoom.messages && data.chatRoom.messages.length !== messages.length) {
                        setMessages(data.chatRoom.messages || []);
                    }
                }
            }
            else if (response.status === 404) {
                await createChatRoom();
            }
            else {
                const errorData = await response.json().catch(() => ({}));
                if (!chatRoom) {
                    toast.error(errorData.message || "Failed to load chat");
                }
            }
        }
        catch (error) {
            console.error("Error fetching chat room:", error);
            if (!chatRoom) {
                toast.error("Failed to load chat. Please try again.");
            }
        }
        finally {
            if (!chatRoom) {
                setLoading(false);
            }
        }
    };
    const createChatRoom = async () => {
        try {
            const response = await api.post('/chat', { bookingId });
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setChatRoom(data.chatRoom);
                    setMessages([]);
                }
            }
            else {
                const errorData = await response.json();
                toast.error(errorData.message || "Failed to create chat room");
            }
        }
        catch (error) {
            console.error("Error creating chat room:", error);
            toast.error("Failed to create chat room");
        }
    };
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !chatRoom)
            return;
        try {
            const response = await api.post(`/chat/${bookingId}/message`, {
                message: newMessage.trim()
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    if (data.message) {
                        setMessages((prev) => [...prev, data.message]);
                    }
                    setNewMessage("");
                }
            }
            else {
                const errorData = await response.json().catch(() => ({}));
                toast.error(errorData.message || "Failed to send message");
            }
        }
        catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message");
        }
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" }) }));
    }
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const isToday = date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();
        if (isToday) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays < 1) {
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            if (diffMins < 1)
                return 'Just now';
            if (diffMins < 60)
                return `${diffMins}m`;
            if (diffHours < 24)
                return `${diffHours}h`;
        }
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    return (_jsxs(Card, { className: "h-[500px] flex flex-col", children: [_jsx("div", { className: "p-4 border-b flex items-center justify-between bg-gray-50", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-semibold", children: (currentUserRole === "client"
                                ? chatRoom?.cleaner?.name?.charAt(0)
                                : chatRoom?.client?.name?.charAt(0)) || '?' }), _jsx("div", { children: _jsx("h3", { className: "font-semibold text-gray-900", children: currentUserRole === "client"
                                    ? chatRoom?.cleaner?.name
                                    : chatRoom?.client?.name }) })] }) }), _jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50", children: [messages.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center h-full text-gray-500", children: [_jsx("div", { className: "w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4", children: _jsx("svg", { className: "w-8 h-8 text-yellow-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" }) }) }), _jsx("p", { className: "text-lg font-medium mb-1", children: "No messages yet" }), _jsx("p", { className: "text-sm", children: "Send a message to start the conversation" })] })) : (messages.map((message) => (_jsx("div", { className: `flex ${message.senderId === currentUserId ? "justify-end" : "justify-start"}`, children: _jsxs("div", { className: `max-w-xs px-4 py-2 rounded-2xl ${message.senderId === currentUserId
                                ? "bg-yellow-500 text-white rounded-br-none"
                                : "bg-white text-gray-900 rounded-bl-none shadow-sm"}`, children: [message.senderName && message.senderId !== currentUserId && (_jsx("div", { className: "text-xs font-semibold mb-1", children: message.senderName })), _jsx("div", { className: "whitespace-pre-wrap break-words", children: message.content || message.message }), _jsxs("div", { className: `text-xs mt-1 ${message.senderId === currentUserId ? "text-yellow-100" : "text-gray-500"}`, children: [formatTime(message.timestamp), message.senderId === currentUserId && (_jsx("span", { className: "ml-1", children: "\u2713\u2713" }))] })] }) }, message.id)))), _jsx("div", { ref: messagesEndRef })] }), _jsx("form", { onSubmit: sendMessage, className: "p-3 border-t bg-white", children: _jsxs("div", { className: "flex gap-2 items-center", children: [_jsx("button", { type: "button", className: "p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full", title: "Attach", children: _jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" }) }) }), _jsx("div", { className: "flex-1 relative", children: _jsx("textarea", { value: newMessage, onChange: (e) => setNewMessage(e.target.value), onKeyDown: (e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage(e);
                                    }
                                }, placeholder: "Type a message...", className: "w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none", rows: 1, style: { minHeight: '40px', maxHeight: '120px' } }) }), _jsx(Button, { type: "submit", disabled: !newMessage.trim(), className: "p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow-md hover:shadow-lg transition-all", children: _jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8" }) }) })] }) })] }));
};
