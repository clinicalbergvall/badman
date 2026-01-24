import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useState, useEffect } from 'react';
import { Button, Badge, Input } from '@/components/ui';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { logger } from '@/lib/logger';
export default function AdminDashboard() {
    const [pending, setPending] = useState([]);
    const [approved, setApproved] = useState([]);
    const [selectedTab, setSelectedTab] = useState('pending');
    const [search, setSearch] = useState('');
    const [cityFilter, setCityFilter] = useState('all');
    const [bookings, setBookings] = useState([]);
    const [bookingStatus, _setBookingStatus] = useState('all');
    const [bookingPage, setBookingPage] = useState(1);
    const [bookingPages, setBookingPages] = useState(0);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const fetchPendingCleaners = async () => {
        try {
            const res = await api.get('/admin/cleaners/pending');
            if (!res.ok)
                throw new Error('Failed to fetch pending cleaners');
            const data = await res.json();
            setPending(data.cleaners || []);
        }
        catch (error) {
            logger.error('Fetch pending cleaners error:', error instanceof Error ? error : undefined);
        }
    };
    const fetchApprovedCleaners = async () => {
        try {
            const res = await api.get('/admin/cleaners/approved');
            if (!res.ok)
                throw new Error('Failed to fetch approved cleaners');
            const data = await res.json();
            setApproved(data.cleaners || []);
        }
        catch (error) {
            logger.error('Fetch approved cleaners error:', error instanceof Error ? error : undefined);
        }
    };
    const fetchBookings = async (status, page = 1) => {
        try {
            const qs = new URLSearchParams();
            if (status && status !== 'all')
                qs.set('status', status);
            qs.set('page', String(page));
            qs.set('limit', '10');
            const res = await api.get(`/admin/bookings?${qs.toString()}`);
            if (!res.ok)
                throw new Error('Failed to fetch bookings');
            const data = await res.json();
            setBookings(data.bookings || []);
            setBookingPages(data.pages || 1);
        }
        catch (error) {
            logger.error('Fetch bookings error:', error instanceof Error ? error : undefined);
        }
    };
    const fetchStats = async () => {
        try {
            const res = await api.get('/admin/dashboard/stats');
            if (!res.ok)
                throw new Error('Failed to fetch stats');
            const data = await res.json();
            setStats(data.stats);
        }
        catch (error) {
            logger.error('Fetch stats error:', error instanceof Error ? error : undefined);
        }
    };
    const loadData = async () => {
        setIsLoading(true);
        await Promise.all([
            fetchPendingCleaners(),
            fetchApprovedCleaners(),
            fetchBookings(bookingStatus, bookingPage),
            fetchStats()
        ]);
        setIsLoading(false);
    };
    useEffect(() => {
        loadData();
    }, []);
    useEffect(() => {
        fetchBookings(bookingStatus, bookingPage);
    }, [bookingStatus, bookingPage]);
    const handleApprove = async (profileId, name) => {
        try {
            const res = await api.put(`/admin/cleaners/${profileId}/approve`, {
                notes: 'Verified via High-Priority Admin Cockpit'
            });
            if (!res.ok)
                throw new Error('Failed to approve');
            toast.success(`${name} verified successfully`);
            loadData();
        }
        catch (error) {
            toast.error('Verification failed');
        }
    };
    const handleReject = async (profileId, name) => {
        try {
            const res = await api.put(`/admin/cleaners/${profileId}/reject`, {
                notes: 'Security clearance denied'
            });
            if (!res.ok)
                throw new Error('Failed to reject');
            toast.error(`${name} rejected`);
            loadData();
        }
        catch (error) {
            toast.error('Rejection failed');
        }
    };
    const uniqueCities = useMemo(() => {
        const cities = new Set([...pending, ...approved].map((c) => c.city).filter(Boolean));
        return ['all', ...Array.from(cities)];
    }, [pending, approved]);
    const filteredCleaners = (selectedTab === 'pending' ? pending : approved)
        .filter((p) => (`${p.firstName} ${p.lastName}`).toLowerCase().includes(search.toLowerCase()))
        .filter((p) => cityFilter === 'all' || p.city === cityFilter);
    return (_jsxs("div", { className: "min-h-screen bg-[#050505] text-slate-200 selection:bg-yellow-500/30 font-inter", children: [_jsxs("div", { className: "fixed inset-0 pointer-events-none", children: [_jsx("div", { className: "absolute top-0 left-1/4 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[120px]" }), _jsx("div", { className: "absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" })] }), _jsxs("div", { className: "relative max-w-[1600px] mx-auto p-4 md:p-8 space-y-8", children: [_jsxs("header", { className: "flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-8 rounded-[2rem] border border-white/5 bg-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden group", children: [_jsxs("div", { className: "flex items-center gap-6", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-0 bg-yellow-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" }), _jsx("img", { src: "/detail-logo.jpg", className: "relative w-16 h-16 rounded-2xl object-cover border border-white/10", alt: "CleanCloak Logo" })] }), _jsxs("div", { children: [_jsxs("h1", { className: "text-3xl font-black tracking-tight text-white flex items-center gap-3", children: ["Operations ", _jsx("span", { className: "text-yellow-400", children: "Cockpit" }), _jsx(Badge, { variant: "outline", className: "border-yellow-500/30 text-yellow-400 bg-yellow-500/5 animate-pulse", children: "LIVE SYSTEM" })] }), _jsx("p", { className: "text-slate-400 font-inter mt-1", children: "Global Verification & Dispatch Control" })] })] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 lg:max-w-3xl", children: [_jsx(StatCard, { label: "Total Value", value: `KSh ${(stats?.totalRevenue || 0).toLocaleString()}`, icon: "\uD83D\uDCB0" }), _jsx(StatCard, { label: "Live Agents", value: stats?.approvedCleaners || 0, icon: "\uD83C\uDF0D" }), _jsx(StatCard, { label: "Pending Approval", value: stats?.pendingCleaners || 0, icon: "\u23F3", highlight: !!stats?.pendingCleaners }), _jsx(StatCard, { label: "Global Jobs", value: stats?.totalBookings || 0, icon: "\uD83D\uDCE6" })] }), _jsx(Button, { onClick: loadData, disabled: isLoading, variant: "primary", className: "h-14 px-8 rounded-2xl bg-white text-black hover:bg-yellow-400 transition-all font-black uppercase tracking-widest text-xs", children: isLoading ? 'Syncing...' : 'Force Refresh' })] }), _jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-md", children: [_jsxs("div", { className: "flex p-1.5 bg-black/40 rounded-2xl border border-white/5 w-full md:w-auto", children: [_jsx(TabButton, { active: selectedTab === 'pending', onClick: () => setSelectedTab('pending'), count: pending.length, label: "Pending Review" }), _jsx(TabButton, { active: selectedTab === 'approved', onClick: () => setSelectedTab('approved'), count: approved.length, label: "Verified Agents" })] }), _jsxs("div", { className: "flex items-center gap-3 w-full md:w-auto", children: [_jsx(Input, { placeholder: "Filter by name...", value: search, onChange: (e) => setSearch(e.target.value), className: "h-12 border-white/5 bg-black/40 rounded-xl focus:ring-yellow-500/50" }), _jsx("select", { className: "h-12 px-4 bg-black/40 border border-white/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50", value: cityFilter, onChange: (e) => setCityFilter(e.target.value), children: uniqueCities.map((c) => _jsx("option", { value: c, children: c === 'all' ? 'All Locations' : c }, c)) })] })] }), _jsx("div", { className: "grid gap-4", children: filteredCleaners.length === 0 ? (_jsx("div", { className: "p-20 text-center rounded-[2rem] border border-dashed border-white/10 bg-white/2", children: _jsx("p", { className: "text-slate-500 font-inter text-sm", children: "No intelligence data matches current protocol filters." }) })) : (filteredCleaners.map((cleaner) => (_jsx(CleanerRow, { cleaner: cleaner, isPending: selectedTab === 'pending', onApprove: () => handleApprove(cleaner._id || cleaner.id, `${cleaner.firstName} ${cleaner.lastName}`), onReject: () => handleReject(cleaner._id || cleaner.id, `${cleaner.firstName} ${cleaner.lastName}`) }, cleaner.id || cleaner._id)))) })] }), _jsxs("aside", { className: "space-y-6", children: [_jsxs("div", { className: "p-6 rounded-[2rem] border border-white/5 bg-white/5 backdrop-blur-xl space-y-6", children: [_jsxs("h3", { className: "text-xl font-black text-white flex items-center gap-2", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-500 animate-pulse" }), "Real-time Dispatch"] }), _jsx("div", { className: "space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar", children: bookings.map((booking) => (_jsxs("div", { className: "p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-white/10 transition-colors group", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsx("p", { className: "text-[10px] font-black uppercase text-yellow-400/80 tracking-widest", children: booking.serviceCategory }), _jsx(Badge, { variant: booking.status === 'completed' ? 'success' : 'default', className: "rounded-lg text-[10px] font-black", children: booking.status.toUpperCase() })] }), _jsx("p", { className: "text-sm font-bold text-white group-hover:text-yellow-400 transition-colors", children: booking.client.name }), _jsxs("p", { className: "text-xs text-slate-400 mt-1 flex items-center gap-1", children: ["\uD83D\uDCCD ", booking.cleaner?.firstName, " ", booking.cleaner?.lastName || 'Unassigned'] }), _jsxs("div", { className: "mt-3 flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-tighter", children: [_jsx("span", { children: new Date(booking.createdAt).toLocaleDateString() }), _jsxs("span", { className: "text-emerald-400", children: ["KSh ", booking.price] })] })] }, booking._id))) }), _jsxs("div", { className: "pt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold", children: [_jsx("button", { onClick: () => setBookingPage((p) => Math.max(1, p - 1)), disabled: bookingPage === 1, className: "px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all font-black", children: "PREV" }), _jsxs("span", { className: "text-slate-500 uppercase text-[10px] tracking-widest", children: ["OP-", bookingPage, " / ", bookingPages] }), _jsx("button", { onClick: () => setBookingPage((p) => Math.min(bookingPages, p + 1)), disabled: bookingPage === bookingPages, className: "px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all font-black", children: "NEXT" })] })] }), _jsxs("div", { className: "p-6 rounded-[2rem] border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-transparent backdrop-blur-3xl text-center space-y-4", children: [_jsx("div", { className: "w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-yellow-500/40", children: _jsx("span", { className: "text-xl", children: "\uD83D\uDC8E" }) }), _jsx("h4", { className: "font-black text-white uppercase tracking-wider text-sm", children: "Elite Platform Status" }), _jsxs("p", { className: "text-xs text-slate-400 leading-relaxed font-inter", children: ["Your system is operating at ", _jsx("span", { className: "text-emerald-400 font-bold", children: "99.9% efficiency" }), ". Security protocols for detailer verification are active."] })] })] })] })] })] }));
}
function StatCard({ label, value, icon, highlight }) {
    return (_jsxs("div", { className: `p-4 rounded-2xl border border-white/5 bg-black/40 backdrop-blur-xl relative group transition-all ${highlight ? 'ring-1 ring-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.1)]' : ''}`, children: [_jsx("div", { className: "text-xl mb-2", children: icon }), _jsx("p", { className: "text-[10px] uppercase tracking-widest text-slate-500 font-black", children: label }), _jsx("p", { className: "text-lg md:text-xl font-black text-white mt-1 group-hover:text-yellow-400 transition-colors truncate", children: value })] }));
}
function TabButton({ active, label, count, onClick }) {
    return (_jsxs("button", { onClick: onClick, className: `px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 flex-1 md:flex-none justify-center ${active ? 'bg-white text-black shadow-xl ring-4 ring-white/10' : 'text-slate-500 hover:text-white hover:bg-white/5'}`, children: [label, _jsx("span", { className: `px-2 py-0.5 rounded-md text-[10px] ${active ? 'bg-black text-white' : 'bg-white/10 text-slate-400'}`, children: count })] }));
}
function CleanerRow({ cleaner, isPending, onApprove, onReject }) {
    return (_jsxs("div", { className: "group p-6 rounded-[2rem] border border-white/5 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-white/10 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6 overflow-hidden", children: [_jsxs("div", { className: "flex items-center gap-6 flex-1 min-w-0", children: [_jsxs("div", { className: "relative flex-shrink-0", children: [cleaner.profileImage ? (_jsx("img", { src: cleaner.profileImage, className: "w-20 h-20 rounded-2xl object-cover ring-2 ring-white/10 shadow-2xl" })) : (_jsxs("div", { className: "w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-3xl ring-2 ring-white/10 uppercase font-black text-slate-600", children: [cleaner.firstName?.[0], cleaner.lastName?.[0]] })), _jsx("div", { className: `absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-4 border-[#0a0a0a] flex items-center justify-center text-[10px] ${cleaner.verified ? 'bg-emerald-500' : 'bg-yellow-500'}`, children: cleaner.verified ? '✓' : '!' })] }), _jsxs("div", { className: "space-y-1 min-w-0 flex-1", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("h4", { className: "text-xl font-black text-white group-hover:text-yellow-400 transition-colors truncate", children: [cleaner.firstName, " ", cleaner.lastName] }), _jsx(Badge, { className: "bg-white/5 text-slate-400 border-none font-black text-[10px] uppercase tracking-tighter flex-shrink-0", children: cleaner.city })] }), _jsxs("p", { className: "text-sm text-slate-400 font-inter truncate", children: [cleaner.phone, " \u2022 ", cleaner.email || 'NO SECURE EMAIL'] }), _jsxs("div", { className: "flex items-center gap-4 mt-2 flex-wrap", children: [_jsx(Metric, { small: true, label: "Jobs", value: cleaner.totalJobs || 0 }), _jsx(Metric, { small: true, label: "Rating", value: `${cleaner.rating || 0} ★` }), _jsxs("div", { className: "flex gap-1", children: [cleaner.verification?.policeCheck && _jsx(Badge, { className: "bg-emerald-500/10 text-emerald-400 text-[8px] px-1 py-0 border-none font-black", children: "POLICE" }), cleaner.verification?.idVerified && _jsx(Badge, { className: "bg-blue-500/10 text-blue-400 text-[8px] px-1 py-0 border-none font-black", children: "ID" })] })] })] })] }), _jsx("div", { className: "flex items-center gap-3 self-end lg:self-center flex-shrink-0", children: isPending ? (_jsxs(_Fragment, { children: [_jsx("button", { onClick: onReject, className: "h-12 px-6 rounded-xl text-rose-500 hover:bg-rose-500/10 font-black uppercase tracking-widest text-[10px] transition-all", children: "Deny Protocol" }), _jsx("button", { onClick: onApprove, className: "h-12 px-8 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20 transition-all", children: "Authorize Agent" })] })) : (_jsx("button", { className: "h-12 px-6 rounded-xl text-slate-500 hover:bg-white/5 font-black uppercase tracking-widest text-[10px] transition-all", children: "Manage Profile" })) })] }));
}
function Metric({ label, value, small: _small }) {
    return (_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "text-[10px] font-black uppercase text-slate-600 tracking-tighter", children: label }), _jsx("span", { className: "text-sm font-black text-slate-200", children: value })] }));
}
