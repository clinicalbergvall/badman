import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Badge, Button } from "@/components/ui";
import CleanerLayout from "@/components/CleanerLayout";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { logger } from "@/lib/logger";
import { LocationMap } from "@/components/ui";
import { calculateCleanerPayout, formatCurrency } from "@/lib/utils";
export default function CleanerJobs() {
    const [jobs, setJobs] = useState([]);
    const [profile, setProfile] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLocationJob, setSelectedLocationJob] = useState(null);
    const navigate = useNavigate();
    const handleViewLocation = (job) => {
        // Validate coordinates before setting the job to view
        const hasValidCoordinates = job.coordinates &&
            Array.isArray(job.coordinates) &&
            job.coordinates.length === 2 &&
            typeof job.coordinates[0] === 'number' &&
            typeof job.coordinates[1] === 'number' &&
            !isNaN(job.coordinates[0]) &&
            !isNaN(job.coordinates[1]) &&
            isFinite(job.coordinates[0]) &&
            isFinite(job.coordinates[1]);
        if (hasValidCoordinates || job.location) {
            setSelectedLocationJob(job);
        }
        else {
            console.warn("Location data is not available or invalid", job);
            toast.error("Location data is not available or invalid");
        }
    };
    const handleCloseLocationModal = () => {
        setSelectedLocationJob(null);
    };
    const getCleanerShareDisplay = (payout) => {
        const numericValue = parseFloat(payout.replace(/[^0-9.-]+/g, ""));
        if (isNaN(numericValue))
            return payout;
        const cleanerEarning = calculateCleanerPayout(numericValue);
        return formatCurrency(cleanerEarning);
    };
    useEffect(() => {
        fetchAllData();
        const interval = setInterval(() => {
            fetchAllData(false);
        }, 30000);
        return () => clearInterval(interval);
    }, []);
    const fetchAllData = async (showLoading = true) => {
        try {
            if (showLoading)
                setIsLoading(true);
            try {
                const profileRes = await api.get("/cleaners/profile");
                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    setProfile(profileData.profile);
                }
                else {
                    logger.error("Failed to fetch profile, status:", new Error(`HTTP ${profileRes.status}`));
                }
            }
            catch (error) {
                logger.error("Error fetching profile:", error instanceof Error ? error : undefined);
                if (showLoading)
                    toast.error("Could not load profile");
            }
            try {
                const jobsRes = await api.get("/bookings/opportunities?limit=50");
                if (jobsRes.ok) {
                    const jobsData = await jobsRes.json();
                    setJobs(jobsData.opportunities || []);
                }
                else {
                    logger.error("Failed to fetch jobs, status:", new Error(`HTTP ${jobsRes.status}`));
                }
            }
            catch (error) {
                logger.error("Error fetching jobs:", error instanceof Error ? error : undefined);
                if (showLoading)
                    toast.error("Could not load job opportunities");
            }
        }
        catch (error) {
            logger.error("Data fetch error:", error instanceof Error ? error : undefined);
            if (showLoading)
                toast.error("Failed to load data");
        }
        finally {
            if (showLoading)
                setIsLoading(false);
        }
    };
    const displayedJobs = useMemo(() => {
        if (!profile?.services?.length)
            return jobs;
        return jobs.filter((job) => profile.services?.includes(job.serviceCategory));
    }, [jobs, profile]);
    const handleRefreshJobs = async () => {
        try {
            setIsRefreshing(true);
            await fetchAllData();
            toast.success("Job feed updated! 🎉");
        }
        catch (error) {
            logger.error("Unable to refresh jobs", error instanceof Error ? error : undefined);
            toast.error("Could not refresh job feed");
        }
        finally {
            setIsRefreshing(false);
        }
    };
    const handleAcceptBooking = async (job) => {
        if (!job.bookingId) {
            toast.error("This opportunity does not include a booking reference");
            return;
        }
        try {
            const res = await api.post(`/bookings/${job.bookingId}/accept`, {});
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.message || "Failed to accept booking");
            }
            const data = await res.json();
            toast.success(data.message || "Booking accepted! 🎉");
            setJobs((prev) => prev.filter((item) => item.id !== job.id));
            fetchAllData();
            navigate("/cleaner-active");
        }
        catch (error) {
            logger.error("Accept booking error:", error instanceof Error ? error : undefined);
            toast.error(error instanceof Error ? error.message : "Failed to accept booking");
        }
    };
    if (isLoading) {
        return (_jsx(CleanerLayout, { currentPage: "jobs", children: _jsx("div", { className: "min-h-[60vh] flex items-center justify-center", children: _jsxs("div", { className: "text-center animate-up", children: [_jsx("div", { className: "w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" }), _jsx("p", { className: "text-gray-600 font-medium", children: "Loading job opportunities..." })] }) }) }));
    }
    return (_jsxs(CleanerLayout, { currentPage: "jobs", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "text-center animate-up", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-2", children: "Available Jobs" }), _jsx("p", { className: "text-gray-600 max-w-2xl mx-auto", children: profile?.firstName && (_jsxs(Badge, { variant: "success", className: "mb-4 text-sm py-1 px-3", children: ["\uD83D\uDE80 ", profile.firstName, ", you're live on CleanCloak Detailer"] })) }), _jsx("p", { className: "text-gray-600 mt-2", children: profile?.services?.length
                                    ? `Showing ${displayedJobs.length} gigs matching your ${profile.services.join(" & ")} services.`
                                    : "Browse curated gigs that match your skills and keep payouts flowing every week." })] }), _jsxs("section", { className: "grid gap-6 lg:grid-cols-3", children: [_jsx("div", { className: "lg:col-span-2 space-y-5", children: _jsxs(Card, { className: "p-6 border border-gray-100 shadow-sm hover-lift", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500 uppercase tracking-wide font-semibold", children: "Available Opportunities" }), _jsx("h2", { className: "text-xl font-bold text-gray-900", children: "Top Matches for You" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Badge, { variant: "warning", className: "hidden sm:flex", children: "Smart Match" }), _jsx(Button, { size: "sm", variant: "outline", onClick: handleRefreshJobs, disabled: isRefreshing, className: "transition-all", children: isRefreshing ? "🔄 Refreshing…" : "🔄 Refresh" })] })] }), _jsx("div", { className: "space-y-4", children: displayedJobs.length === 0 ? (_jsxs(Card, { className: "p-8 text-center bg-gray-50 border-dashed border-2 border-gray-200", children: [_jsx("div", { className: "w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx("span", { className: "text-3xl", children: "\uD83D\uDCED" }) }), _jsx("p", { className: "text-gray-900 font-semibold mb-2", children: "No Jobs Available" }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: profile?.services?.length
                                                            ? "No jobs match your services yet—check back soon."
                                                            : "Add your services to see matching jobs." }), _jsx(Button, { onClick: handleRefreshJobs, disabled: isRefreshing, children: "Refresh Jobs" })] })) : (displayedJobs.map((job) => (_jsxs(Card, { className: "p-5 border border-gray-100 bg-white space-y-4 hover:border-yellow-400 hover:shadow-lg transition-all duration-300 hover:-translate-y-1", children: [_jsxs("div", { className: "flex flex-col gap-2", children: [_jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsx("h3", { className: "text-lg font-bold text-gray-900", children: job.title }), job.priority && (_jsx(Badge, { variant: job.priority === "featured"
                                                                            ? "warning"
                                                                            : "outline", className: "capitalize shrink-0", children: job.priority === "auto-team"
                                                                            ? "🤖 Auto"
                                                                            : `⭐ ${job.priority}` }))] }), _jsxs("div", { className: "flex flex-wrap items-center gap-4 text-sm text-gray-600", children: [_jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx("span", { children: "\uD83D\uDCCD" }), _jsx("span", { children: job.location })] }), _jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx("span", { children: "\uD83D\uDD50" }), _jsx("span", { children: job.timing })] })] }), _jsx("div", { className: "flex flex-wrap items-center gap-2", children: job.coordinates && (_jsx(Button, { size: "sm", variant: "outline", className: "text-xs", onClick: () => handleViewLocation(job), children: "\uD83D\uDDFA\uFE0F View Location" })) }), _jsx("p", { className: "text-xl font-bold text-emerald-600", children: getCleanerShareDisplay(job.payout) })] }), _jsxs("div", { className: "text-sm text-gray-600 bg-gray-50 rounded-lg p-3", children: [_jsxs("p", { className: "font-semibold text-gray-900 mb-2 flex items-center gap-1", children: [_jsx("span", { children: "\uD83D\uDCCB" }), _jsx("span", { children: "Requirements" })] }), _jsx("ul", { className: "list-disc list-inside space-y-1 ml-1", children: job.requirements.map((item, i) => (_jsx("li", { children: item }, i))) })] }), _jsx("div", { className: "flex gap-3 flex-wrap pt-2", children: _jsx(Button, { size: "sm", className: "flex-1 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold shadow-md hover:shadow-lg transition-all", onClick: () => handleAcceptBooking(job), disabled: !job.bookingId, children: "\uD83C\uDFAF Accept Job" }) })] }, job.id)))) })] }) }), _jsx("div", { className: "space-y-6", children: _jsxs(Card, { className: "p-6 border border-gray-100 shadow-sm hover-lift", children: [_jsxs("div", { className: "mb-4", children: [_jsx("p", { className: "text-xs text-gray-500 uppercase tracking-wide font-semibold", children: "Your Stats" }), _jsx("h2", { className: "text-lg font-bold text-gray-900", children: "Performance" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg", children: [_jsx("span", { className: "text-sm font-medium text-gray-600", children: "Available Jobs" }), _jsx("span", { className: "text-2xl font-bold text-gray-900", children: jobs.length })] }), _jsxs("div", { className: "flex items-center justify-between p-3 bg-emerald-50 rounded-lg", children: [_jsx("span", { className: "text-sm font-medium text-emerald-700", children: "Matched Jobs" }), _jsx("span", { className: "text-2xl font-bold text-emerald-600", children: displayedJobs.length })] }), profile?.rating && (_jsxs("div", { className: "flex items-center justify-between p-3 bg-yellow-50 rounded-lg", children: [_jsx("span", { className: "text-sm font-medium text-yellow-700", children: "Your Rating" }), _jsxs("span", { className: "text-2xl font-bold text-yellow-600", children: ["\u2B50 ", profile.rating.toFixed(1)] })] }))] })] }) })] })] }), selectedLocationJob && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "bg-white rounded-lg max-w-2xl w-full max-h-[80vh]", children: [_jsxs("div", { className: "p-4 border-b flex items-center justify-between", children: [_jsxs("h3", { className: "text-lg font-semibold", children: ["Client Location - ", selectedLocationJob.title] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: handleCloseLocationModal, children: "\u2715" })] }), _jsx("div", { className: "p-4", children: _jsx(LocationMap, { location: {
                                    address: selectedLocationJob.location,
                                    coordinates: selectedLocationJob.coordinates || undefined,
                                    manualAddress: undefined
                                }, title: "Client Location" }) })] }) }))] }));
}
