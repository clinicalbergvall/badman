import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { Button, Card } from './ui';
import { loadUserSession } from '@/lib/storage';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { io } from 'socket.io-client';
import { safeLogError, getUserFriendlyError } from '@/lib/errorHandler';
export default function ChatBox({ bookingId, currentUserId, currentUserName, currentUserRole }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await api.get(`/chat/${bookingId}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.chatRoom && data.chatRoom.messages) {
                        if (data.chatRoom.messages.length !== messages.length) {
                            const transformedMessages = data.chatRoom.messages.map((msg) => ({
                                id: msg._id,
                                bookingId: bookingId,
                                senderId: msg.sender._id || msg.sender,
                                senderName: msg.sender.name || (msg.senderRole === 'client' ? 'Client' : 'Cleaner'),
                                senderRole: msg.senderRole,
                                message: msg.message,
                                timestamp: msg.timestamp,
                                read: msg.senderRole !== currentUserRole ? (msg.senderRole === 'client' ? msg.readByClient : msg.readByCleaner) : true,
                            }));
                            setMessages(transformedMessages);
                        }
                    }
                }
            }
            catch (error) {
                safeLogError('ChatBox:fetchMessages', error);
                if (messages.length === 0) {
                    toast.error('Failed to load messages. Please try again.');
                }
            }
        };
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [bookingId, currentUserId, currentUserName, currentUserRole, messages.length]);
    useEffect(() => {
        const handleResize = () => {
            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
                const viewportHeight = window.innerHeight;
                const documentHeight = document.documentElement.scrollHeight;
                const heightDifference = Math.abs(documentHeight - viewportHeight);
                const keyboardVisible = heightDifference > 150 || viewportHeight < window.screen.height * 0.75;
                setIsKeyboardVisible(keyboardVisible);
                // Scroll to bottom when keyboard visibility changes
                if (keyboardVisible && inputRef.current && document.activeElement === inputRef.current) {
                    setTimeout(() => {
                        // Scroll input into view
                        inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
                        // Scroll messages to show latest
                        setTimeout(() => {
                            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
                        }, 200);
                    }, 300);
                }
            }
            else {
                setIsKeyboardVisible(false);
            }
        };
        // Listen for visual viewport changes (better for mobile keyboard detection)
        const handleViewportChange = () => {
            if (window.visualViewport) {
                const viewportHeight = window.visualViewport.height;
                const windowHeight = window.innerHeight;
                const keyboardVisible = viewportHeight < windowHeight * 0.75;
                setIsKeyboardVisible(keyboardVisible);
                if (keyboardVisible && inputRef.current && document.activeElement === inputRef.current) {
                    setTimeout(() => {
                        inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
                        setTimeout(() => {
                            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
                        }, 200);
                    }, 300);
                }
            }
        };
        // Listen for both resize and orientationchange events
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleViewportChange);
            window.visualViewport.addEventListener('scroll', handleViewportChange);
        }
        handleResize();
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', handleViewportChange);
                window.visualViewport.removeEventListener('scroll', handleViewportChange);
            }
        };
    }, []);
    useEffect(() => {
        let socket = null;
        const session = loadUserSession();
        if (!session?.id)
            return;
        try {
            const OVERRIDE_API_URL = localStorage.getItem('apiOverride') || '';
            const VITE_API_URL = import.meta.env.VITE_API_URL;
            const base = OVERRIDE_API_URL || VITE_API_URL || window.location.origin;
            const socketUrl = base.endsWith('/api') ? base.slice(0, -4) : base;
            socket = io(socketUrl, {
                query: { userId: session.id },
                transports: ['websocket'],
                withCredentials: true
            });
            socket.on('newMessage', (data) => {
                const { message: newMessage } = data || {};
                if (newMessage && newMessage.bookingId === bookingId &&
                    !messages.some((msg) => msg.id === newMessage.id)) {
                    const transformedMessage = {
                        id: newMessage._id || Date.now().toString(),
                        bookingId: bookingId,
                        senderId: newMessage.senderId || newMessage.sender,
                        senderName: newMessage.senderName || (newMessage.senderRole === 'client' ? 'Client' : 'Cleaner'),
                        senderRole: newMessage.senderRole,
                        message: newMessage.message,
                        timestamp: newMessage.timestamp || new Date().toISOString(),
                        read: newMessage.read || false,
                    };
                    setMessages((prev) => [...prev, transformedMessage]);
                }
            });
            return () => {
                if (socket)
                    socket.disconnect();
            };
        }
        catch (e) {
            safeLogError('ChatBox:socketSetup', e);
        }
    }, [bookingId, currentUserId, currentUserName, currentUserRole]);
    const handleSendMessage = async () => {
        if (!newMessage.trim())
            return;
        try {
            const response = await api.post(`/chat/${bookingId}/message`, {
                message: newMessage.trim()
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    setMessages((prev) => [...prev, data.data]);
                    setNewMessage('');
                }
                else {
                    toast.error(data.message || 'Failed to send message');
                }
            }
            else {
                const errorData = await response.json().catch(() => ({}));
                toast.error(errorData.message || 'Failed to send message');
            }
        }
        catch (error) {
            safeLogError('ChatBox:sendMessage', error);
            toast.error(getUserFriendlyError(error));
        }
    };
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
    const groupMessagesByDate = (messages) => {
        const groups = {};
        messages.forEach(message => {
            const date = new Date(message.timestamp);
            const today = new Date();
            const dateKey = date.toISOString().split('T')[0];
            const todayKey = today.toISOString().split('T')[0];
            const displayKey = dateKey === todayKey ? 'Today' : dateKey;
            if (!groups[displayKey]) {
                groups[displayKey] = [];
            }
            groups[displayKey].push(message);
        });
        return groups;
    };
    return (_jsxs(Card, { className: `flex flex-col ${isKeyboardVisible ? 'h-[calc(100vh-200px)]' : 'h-[500px]'} max-h-[70vh]`, children: [_jsx("div", { className: "p-4 border-b border-gray-200 flex-shrink-0", children: _jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900", children: "Chat" }), _jsxs("p", { className: "text-xs text-gray-500", children: ["Booking #", bookingId.slice(0, 8)] })] }) }) }), _jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-4 pb-4", ref: messagesEndRef, style: {
                    WebkitOverflowScrolling: 'touch',
                    paddingBottom: isKeyboardVisible ? '20px' : '16px'
                }, children: [messages.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center h-full text-gray-500", children: [_jsx("svg", { className: "w-12 h-12 mb-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" }) }), _jsx("p", { className: "text-sm", children: "No messages yet" }), _jsx("p", { className: "text-xs", children: "Start the conversation!" })] })) : (Object.entries(groupMessagesByDate(messages)).map(([date, dateMessages]) => (_jsxs("div", { children: [_jsx("div", { className: "text-center my-4", children: _jsx("span", { className: "inline-block px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full", children: date === 'Today'
                                        ? 'Today'
                                        : new Date(date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }) }) }), dateMessages.map((msg) => {
                                const isClientMessage = msg.senderRole === 'client';
                                return (_jsx("div", { className: `flex ${isClientMessage ? 'justify-end' : 'justify-start'} mb-3`, children: _jsxs("div", { className: `${isClientMessage ? 'order-2' : 'order-1'} ${isClientMessage ? 'ml-auto' : 'mr-auto'}`, children: [_jsxs("div", { className: `rounded-2xl px-4 py-2 ${isClientMessage
                                                    ? 'bg-blue-500 text-white rounded-br-none'
                                                    : 'bg-gray-300 text-gray-800 rounded-bl-none'}`, children: [!isClientMessage && msg.senderName && (_jsx("p", { className: "text-xs font-semibold mb-1", children: msg.senderName })), _jsx("p", { className: "text-sm whitespace-pre-wrap break-words", children: msg.message })] }), _jsxs("div", { className: `text-xs ${isClientMessage ? 'text-blue-100' : 'text-gray-500'} mt-1 flex ${isClientMessage ? 'flex-row-reverse justify-end' : 'justify-start'}`, children: [_jsx("span", { children: formatTime(msg.timestamp) }), isClientMessage && (_jsx("span", { className: "ml-1", children: msg.read ? '✓✓' : '✓' }))] })] }) }, msg.id));
                            })] }, date)))), _jsx("div", { ref: messagesEndRef })] }), _jsx("div", { className: `p-4 border-t border-gray-200 bg-white flex-shrink-0 ${isKeyboardVisible ? 'pb-safe' : ''}`, style: {
                    paddingBottom: isKeyboardVisible ? 'env(safe-area-inset-bottom, 20px)' : '16px'
                }, children: _jsxs("div", { className: "flex gap-2 items-end", children: [_jsx("div", { className: "flex-1 relative", children: _jsx("textarea", { value: newMessage, onChange: (e) => setNewMessage(e.target.value), onKeyDown: (e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }, placeholder: "Type a message...", ref: inputRef, className: `w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none ${isKeyboardVisible ? 'z-10' : ''}`, rows: 1, style: { minHeight: '40px', maxHeight: '100px' }, onTouchStart: (e) => {
                                    // On touch devices, ensure the input is focused
                                    setTimeout(() => {
                                        e.currentTarget.focus();
                                    }, 100);
                                }, onClick: (e) => {
                                    // Additional click handler to ensure focus on mobile
                                    if (isKeyboardVisible) {
                                        setTimeout(() => {
                                            e.currentTarget.focus();
                                        }, 0);
                                    }
                                }, onFocus: (e) => {
                                    // Ensure the input stays visible when keyboard appears on mobile
                                    if (window.innerWidth <= 768) {
                                        setTimeout(() => {
                                            // Scroll input into view
                                            e.target.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
                                            // Also scroll messages to show latest
                                            setTimeout(() => {
                                                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
                                            }, 150);
                                        }, 300);
                                    }
                                }, onBlur: () => {
                                    // Scroll to bottom when input loses focus
                                    setTimeout(() => {
                                        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                                    }, 100);
                                } }) }), _jsx(Button, { onClick: handleSendMessage, disabled: !newMessage.trim(), className: "p-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow-md hover:shadow-lg transition-all", children: _jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8" }) }) })] }) })] }));
}
