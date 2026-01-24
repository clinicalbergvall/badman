import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { loadUserSession } from "@/lib/storage";
import toast from "react-hot-toast";
import ErrorBoundary from "../components/ErrorBoundary";
import { logger } from "@/lib/logger";
import { api } from "@/lib/api";
export default function ClientProfile() {
    const [profile, setProfile] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        loadProfileData();
    }, []);
    const loadProfileData = async () => {
        try {
            const session = loadUserSession();
            if (!session) {
                setLoading(false);
                return;
            }
            const initialProfile = {
                name: session.name || "Client",
                phone: session.phone || "",
                totalTransactions: 0,
                totalDeals: 0,
                totalSpent: 0,
                memberSince: session.lastSignedIn
                    ? new Date(session.lastSignedIn).toLocaleDateString()
                    : new Date().toLocaleDateString(),
                verificationStatus: "verified",
            };
            const response = await api.get("/bookings");
            if (response.ok) {
                const data = await response.json();
                const transactionData = data.bookings?.map((booking) => ({
                    id: booking._id,
                    type: "booking",
                    amount: booking.totalPrice || 0,
                    status: booking.status,
                    date: booking.createdAt,
                    description: `Cleaning service - ${booking.serviceType || "Standard"}`,
                    serviceType: booking.serviceType,
                    cleanerName: booking.cleanerName,
                })) || [];
                setTransactions(transactionData);
                const completedDeals = transactionData.filter((t) => t.status === "completed").length;
                const totalSpent = transactionData
                    .filter((t) => t.status === "completed")
                    .reduce((sum, t) => sum + t.amount, 0);
                setProfile({
                    ...initialProfile,
                    totalTransactions: transactionData.length,
                    totalDeals: completedDeals,
                    totalSpent,
                });
            }
            else {
                setProfile(initialProfile);
            }
        }
        catch (error) {
            logger.error("Profile load error:", error instanceof Error ? error : undefined);
            toast.error("Failed to load profile data");
        }
        finally {
            setLoading(false);
        }
    };
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" }) }));
    }
    return (_jsx(ErrorBoundary, { children: _jsx("div", { className: "min-h-screen bg-gray-50", children: _jsxs("div", { className: "w-full px-1 py-2 overflow-x-auto", children: [_jsxs("div", { className: "flex items-center gap-2 mb-6", children: [_jsx("button", { onClick: () => window.history.back(), className: "text-gray-600 hover:text-gray-900 flex items-center gap-1", children: _jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }) }), _jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "My Profile" })] }), !profile ? (_jsxs("div", { className: "bg-white rounded-xl shadow-sm p-6 text-center w-full", children: [_jsx("div", { className: "w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx("svg", { className: "w-10 h-10 text-blue-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" }) }) }), _jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Login Required" }), _jsx("p", { className: "text-gray-600 mb-6", children: "Please login to view your profile and booking history" }), _jsxs("div", { className: "space-y-3", children: [_jsx("button", { onClick: () => (window.location.href = "/test-login"), className: "w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg", children: "Login / Register" }), _jsx("button", { onClick: () => (window.location.href = "/"), className: "w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold", children: "Go to Home" })] })] })) : (_jsxs("div", { className: "bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-lg p-6 border border-gray-800", children: [_jsxs("div", { className: "flex items-center space-x-5 mb-8", children: [_jsx("div", { className: "w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg", children: _jsx("span", { className: "text-3xl font-bold text-white", children: profile.name.charAt(0).toUpperCase() }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-100", children: profile.name }), _jsx("p", { className: "text-gray-300 text-lg", children: profile.phone })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8", children: [_jsxs("div", { className: "bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl text-center shadow-sm border border-gray-700", children: [_jsxs("div", { className: "relative inline-block mb-3", children: [_jsxs("svg", { className: "w-16 h-16 text-blue-400", viewBox: "0 0 36 36", children: [_jsx("circle", { cx: "18", cy: "18", r: "15", fill: "none", stroke: "#1e293b", strokeWidth: "2" }), (() => {
                                                                const circumference = 2 * Math.PI * 15;
                                                                const offset = circumference - (Math.min(profile.totalTransactions / 20, 1) * circumference);
                                                                return (_jsx("circle", { cx: "18", cy: "18", r: "15", fill: "none", stroke: "#3b82f6", strokeWidth: "2", strokeDasharray: `${circumference} ${circumference}`, strokeDashoffset: offset, transform: "rotate(-90 18 18)" }));
                                                            })()] }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsx("span", { className: "text-xl font-bold text-blue-400", children: profile.totalTransactions }) })] }), _jsx("div", { className: "text-sm font-medium text-blue-400", children: "Transactions" })] }), _jsxs("div", { className: "bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl text-center shadow-sm border border-gray-700", children: [_jsxs("div", { className: "relative inline-block mb-3", children: [_jsxs("svg", { className: "w-16 h-16 text-green-400", viewBox: "0 0 36 36", children: [_jsx("circle", { cx: "18", cy: "18", r: "15", fill: "none", stroke: "#1e293b", strokeWidth: "2" }), (() => {
                                                                const circumference = 2 * Math.PI * 15;
                                                                const offset = circumference - (Math.min(profile.totalDeals / 20, 1) * circumference);
                                                                return (_jsx("circle", { cx: "18", cy: "18", r: "15", fill: "none", stroke: "#10b981", strokeWidth: "2", strokeDasharray: `${circumference} ${circumference}`, strokeDashoffset: offset, transform: "rotate(-90 18 18)" }));
                                                            })()] }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsx("span", { className: "text-xl font-bold text-green-400", children: profile.totalDeals }) })] }), _jsx("div", { className: "text-sm font-medium text-green-400", children: "Completed" })] }), _jsxs("div", { className: "bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl text-center shadow-sm border border-gray-700", children: [_jsxs("div", { className: "relative inline-block mb-3", children: [_jsxs("svg", { className: "w-16 h-16 text-purple-400", viewBox: "0 0 36 36", children: [_jsx("circle", { cx: "18", cy: "18", r: "15", fill: "none", stroke: "#1e293b", strokeWidth: "2" }), (() => {
                                                                const circumference = 2 * Math.PI * 15;
                                                                const offset = circumference - (Math.min(profile.totalSpent / 50000, 1) * circumference);
                                                                return (_jsx("circle", { cx: "18", cy: "18", r: "15", fill: "none", stroke: "#8b5cf6", strokeWidth: "2", strokeDasharray: `${circumference} ${circumference}`, strokeDashoffset: offset, transform: "rotate(-90 18 18)" }));
                                                            })()] }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsxs("span", { className: "text-xl font-bold text-purple-400", children: ["KSH ", profile.totalSpent] }) })] }), _jsx("div", { className: "text-sm font-medium text-purple-400", children: "Total Spent" })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-lg mb-4 text-gray-100", children: "Recent Transactions" }), transactions.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3", children: _jsx("svg", { className: "w-8 h-8 text-gray-300", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" }) }) }), _jsx("p", { className: "text-gray-400", children: "No transactions yet" })] })) : (_jsx("div", { className: "space-y-4", children: transactions.slice(0, 5).map((transaction, index) => (_jsxs("div", { className: "relative pl-8 pb-6 last:pb-0", children: [_jsx("div", { className: "absolute left-0 top-2 w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center", children: _jsx("div", { className: "w-2 h-2 bg-white rounded-full" }) }), index < transactions.slice(0, 5).length - 1 && (_jsx("div", { className: "absolute left-2.5 top-8 w-0.5 h-full bg-gradient-to-b from-yellow-400 to-yellow-200" })), _jsx("div", { className: "bg-gray-800/90 backdrop-blur-sm p-4 rounded-xl border border-gray-700 shadow-sm hover:shadow-md transition-shadow", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-100", children: transaction.description }), _jsxs("p", { className: "text-sm text-gray-400 mt-1 flex items-center gap-2", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" }) }), new Date(transaction.date).toLocaleDateString()] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "font-bold text-lg text-gray-100", children: ["KSH ", transaction.amount] }), _jsxs("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.status === "completed"
                                                                            ? "bg-green-100 text-green-800"
                                                                            : transaction.status === "pending"
                                                                                ? "bg-yellow-100 text-yellow-800"
                                                                                : "bg-red-100 text-red-800"}`, children: [_jsx("span", { className: `mr-1 w-2 h-2 rounded-full inline-block ${transaction.status === "completed"
                                                                                    ? "bg-green-500"
                                                                                    : transaction.status === "pending"
                                                                                        ? "bg-yellow-500"
                                                                                        : "bg-red-500"}` }), transaction.status] })] })] }) })] }, transaction.id))) }))] })] }))] }) }) }));
}
