import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Card, Badge } from '@/components/ui';
import CleanerLayout from '@/components/CleanerLayout';
import { api } from '@/lib/api';
import { loadUserSession } from '@/lib/storage';
import { calculateCleanerPayout, formatCurrency } from '@/lib/utils';
import { toast } from 'react-hot-toast';
export default function Earnings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEarned: 0,
        pendingPayout: 0,
        jobsCompleted: 0
    });
    useEffect(() => {
        fetchEarnings();
    }, []);
    const fetchEarnings = async () => {
        try {
            const user = loadUserSession();
            if (!user)
                return;
            const response = await api.get('/bookings');
            if (response.ok) {
                const data = await response.json();
                const allBookings = data.bookings || [];
                // Filter for completed bookings only
                const completed = allBookings.filter((b) => b.status === 'completed').sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime());
                setBookings(completed);
                calculateStats(completed);
            }
        }
        catch (error) {
            console.error('Failed to fetch earnings:', error);
            toast.error('Could not load earnings history');
        }
        finally {
            setLoading(false);
        }
    };
    const calculateStats = (completedJobs) => {
        let total = 0;
        let pending = 0;
        completedJobs.forEach(job => {
            const earnings = calculateCleanerPayout(job.price);
            // If payout marked as completed (or paid via other mechanism), add to total
            // Otherwise if job is done but payout not sent, add to pending
            if (job.payoutStatus === 'completed') {
                total += earnings;
            }
            else {
                pending += earnings;
            }
        });
        setStats({
            totalEarned: total,
            pendingPayout: pending,
            jobsCompleted: completedJobs.length
        });
    };
    if (loading) {
        return (_jsx(CleanerLayout, { currentPage: "earnings", children: _jsx("div", { className: "flex justify-center items-center h-[60vh]", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400" }) }) }));
    }
    return (_jsx(CleanerLayout, { currentPage: "earnings", children: _jsxs("div", { className: "space-y-6 pb-20", children: [_jsxs("div", { className: "text-center animate-up", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-2", children: "My Earnings" }), _jsx("p", { className: "text-gray-600", children: "Track your payouts and income history." })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs(Card, { className: "p-4 bg-green-50 border-green-100", children: [_jsx("p", { className: "text-sm text-green-800 font-medium mb-1", children: "Total Earned" }), _jsx("p", { className: "text-2xl font-bold text-green-700", children: formatCurrency(stats.totalEarned) })] }), _jsxs(Card, { className: "p-4 bg-yellow-50 border-yellow-100", children: [_jsx("p", { className: "text-sm text-yellow-800 font-medium mb-1", children: "Pending Payout" }), _jsx("p", { className: "text-2xl font-bold text-yellow-700", children: formatCurrency(stats.pendingPayout) })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900", children: "Recent Payouts" }), bookings.length === 0 ? (_jsxs(Card, { className: "p-8 text-center border-dashed", children: [_jsx("span", { className: "text-4xl block mb-2", children: "\uD83D\uDCB8" }), _jsx("p", { className: "text-gray-500", children: "No completed jobs yet." })] })) : (bookings.map((job) => {
                            const earning = calculateCleanerPayout(job.price);
                            const isPaid = job.payoutStatus === 'completed';
                            return (_jsxs(Card, { className: "p-4 flex justify-between items-center transition-shadow hover:shadow-md", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900 capitalize", children: job.serviceCategory.replace('-', ' ') }), _jsxs("p", { className: "text-xs text-gray-500", children: [new Date(job.completedAt).toLocaleDateString(), " at ", new Date(job.completedAt).toLocaleTimeString()] }), _jsx("div", { className: "mt-1", children: isPaid ? (_jsx(Badge, { variant: "success", className: "text-xs", children: "Paid to M-Pesa" })) : (_jsx(Badge, { variant: "warning", className: "text-xs", children: "Processing" })) })] }), _jsx("div", { className: "text-right", children: _jsxs("p", { className: `font-bold text-lg ${isPaid ? 'text-green-600' : 'text-gray-600'}`, children: ["+", formatCurrency(earning)] }) })] }, job._id || job.id));
                        }))] })] }) }));
}
