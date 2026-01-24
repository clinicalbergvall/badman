import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Card } from '@/components/ui';
import LiveTracking from '@/components/LiveTracking';
import ChatBox from '@/components/ChatBox';
import VerificationBadge from '@/components/VerificationBadge';
import { api } from '@/lib/api';
import { loadUserSession } from '@/lib/storage';
export default function ActiveBooking() {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('tracking');
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const ChatBoxWithUserData = ({ bookingId }) => {
        const userSession = loadUserSession();
        if (!userSession) {
            return _jsx("div", { className: "p-4 text-center text-gray-500", children: "Please log in to use chat" });
        }
        return (_jsx(ChatBox, { bookingId: bookingId, currentUserId: userSession.phone, currentUserName: userSession.name, currentUserRole: userSession.userType }));
    };
    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const response = await api.get(id ? `/bookings/${id}` : "/bookings/active");
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.booking) {
                        setBooking(data.booking);
                    }
                }
            }
            catch (error) {
                setBooking(null);
            }
            finally {
                setLoading(false);
            }
        };
        fetchBooking();
    }, [id]);
    if (loading) {
        return _jsx("div", { children: "Loading..." });
    }
    if (!booking) {
        return _jsx("div", { children: "No active booking found." });
    }
    const clientLocation = {
        latitude: booking.location?.coordinates?.[0] || -1.2921,
        longitude: booking.location?.coordinates?.[1] || 36.8219,
        address: booking.location?.address || booking.location?.manualAddress || 'Nairobi, Kenya',
        coordinates: booking.location?.coordinates || [-1.2921, 36.8219]
    };
    const cleanerVerification = {
        idVerified: true,
        idNumber: 'ID-12345678',
        policeCheck: true,
        references: [
            {
                id: '1',
                name: 'Jane Smith',
                phone: '0723456789',
                relationship: 'Previous Client',
                verified: true
            },
            {
                id: '2',
                name: 'Mike Johnson',
                phone: '0734567890',
                relationship: 'Colleague',
                verified: true
            }
        ],
        insuranceCoverage: false,
        verifiedAt: new Date().toISOString()
    };
    const handleReportIssue = () => {
        const details = window.prompt('Tell us what went wrong so support can reach out:');
        if (details && details.trim().length > 0) {
            window.alert('Thanks for the report. CleanCloak support will contact you shortly.');
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black p-4 md:p-6", children: _jsxs("div", { className: "w-full space-y-6", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("button", { onClick: () => window.history.back(), className: "p-2 hover:bg-gray-100 rounded-lg transition-colors", children: _jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-100", children: "Active Booking" }), _jsxs("p", { className: "text-sm text-gray-400", children: ["Booking #", booking.id.slice(0, 8)] })] })] }), _jsx(Card, { className: "p-6 bg-gray-800/90 border-gray-700 text-gray-100", children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white text-2xl font-bold", children: booking.cleanerName.split(' ').map((n) => n[0]).join('') }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-gray-100", children: booking.cleanerName }), _jsx("p", { className: "text-sm text-gray-400", children: booking.cleanerPhone })] }), _jsx(VerificationBadge, { verification: cleanerVerification, size: "sm" })] }), _jsxs("div", { className: "mt-4 grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-400", children: "Service" }), _jsx("p", { className: "text-sm font-medium text-gray-100", children: booking.serviceType })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-400", children: "Vehicle" }), _jsx("p", { className: "text-sm font-medium text-gray-100", children: booking.vehicleType })] })] }), _jsxs("div", { className: "mt-4 flex items-center gap-3", children: [_jsxs(Button, { variant: "outline", className: "flex-1", onClick: () => {
                                                    const telLink = `tel:${booking.cleanerPhone.replace(/\s+/g, '')}`;
                                                    window.location.href = telLink;
                                                }, "aria-label": `Call ${booking.cleanerName}`, children: [_jsx("svg", { className: "w-5 h-5 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" }) }), "Call Cleaner"] }), _jsx(Button, { variant: "outline", className: "px-4", onClick: () => {
                                                    alert('Verification details modal would open here');
                                                }, children: _jsx("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z", clipRule: "evenodd" }) }) })] })] })] }) }), _jsxs("div", { className: "flex gap-2 border-b border-gray-700", children: [_jsxs("button", { onClick: () => setActiveTab('tracking'), className: `px-6 py-3 font-medium transition-colors relative ${activeTab === 'tracking'
                                ? 'text-yellow-400'
                                : 'text-gray-400 hover:text-gray-200'}`, children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 11a3 3 0 11-6 0 3 3 0 016 0z" })] }), _jsx("span", { children: "Live Tracking" })] }), activeTab === 'tracking' && (_jsx("div", { className: "absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-600" }))] }), _jsxs("button", { onClick: () => setActiveTab('chat'), className: `px-6 py-3 font-medium transition-colors relative ${activeTab === 'chat'
                                ? 'text-yellow-400'
                                : 'text-gray-400 hover:text-gray-200'}`, children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" }) }), _jsx("span", { children: "Chat" }), _jsx("span", { className: "ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full", children: "2" })] }), activeTab === 'chat' && (_jsx("div", { className: "absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-600" }))] })] }), _jsx("div", { children: activeTab === 'tracking' ? (_jsx(LiveTracking, { bookingId: booking.id, clientLocation: clientLocation })) : (_jsx(ChatBoxWithUserData, { bookingId: booking.id })) }), _jsx(Card, { className: "p-4 bg-red-900/30 border-red-800", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-red-500 rounded-full flex items-center justify-center", children: _jsx("svg", { className: "w-6 h-6 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-red-100", children: "Need Help?" }), _jsx("p", { className: "text-sm text-green-700", children: "CleanCloak support will contact you shortly." })] })] }), _jsx(Button, { variant: "outline", className: "border-red-600 text-red-300 hover:bg-red-900/50", onClick: handleReportIssue, children: "Report Issue" })] }) })] }) }));
}
