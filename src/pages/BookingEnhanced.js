import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo, useRef } from "react";
import { Button, Input, Card, ProgressBar, } from "@/components/ui";
import CleanerProfile from "./CleanerProfile";
import LocationMap from "@/components/LocationMap";
import { VEHICLE_CATEGORIES, CAR_SERVICE_PACKAGES, PAINT_CORRECTION_STAGES, CAR_DETAILING_EXTRAS, getCarDetailingPrice, } from "@/lib/validation";
import { formatCurrency, formatPhoneNumber } from "@/lib/utils";
import { saveUserSession, loadUserSession, clearUserSession, } from "@/lib/storage";
import { getCurrentLocation, getLocationPermissionStatus, reverseGeocode } from "@/lib/location";
import authAPI from "@/lib/auth-api";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
export default function BookingEnhanced() {
    const carVideoRef = useRef(null);
    const homeVideoRef = useRef(null);
    const [canAutoplay, setCanAutoplay] = useState(true);
    const useMobileSrc = useMemo(() => {
        if (!canAutoplay)
            return true;
        if (typeof window === 'undefined')
            return false;
        return window.innerWidth <= 768;
    }, [canAutoplay]);
    const getVideoSrc = (src) => {
        if (!src || !src.endsWith('.mp4'))
            return src;
        if (/-mobile-720p\.mp4$/.test(src))
            return src;
        if (!useMobileSrc)
            return src;
        const base = src.slice(0, -4);
        return `${base}-mobile-720p.mp4`;
    };
    const [userType, setUserType] = useState(null);
    const [step, setStep] = useState(0);
    const serviceCategory = "car-detailing";
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [isSignup, setIsSignup] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [vehicleType, setVehicleType] = useState("");
    const [carServicePackage, setCarServicePackage] = useState("");
    const [paintStage, setPaintStage] = useState("");
    const [midSUVTier, setMidSUVTier] = useState("STANDARD");
    const [fleetCarCount, setFleetCarCount] = useState(5);
    const [selectedCarExtras, setSelectedCarExtras] = useState([]);
    const [failedPackage, setFailedPackage] = useState({});
    const [vehicleVideoFailed, setVehicleVideoFailed] = useState(false);
    const [bookingType, setBookingType] = useState("immediate");
    const [scheduledDate, setScheduledDate] = useState("");
    const [scheduledTime, setScheduledTime] = useState("");
    const [paymentMethod, _setPaymentMethod] = useState("mpesa");
    const [location, setLocation] = useState({});
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [locationPermission, setLocationPermission] = useState("unknown");
    const [isSubmitting, setIsSubmitting] = useState(false);
    useEffect(() => {
        const session = loadUserSession();
        if (session) {
            setUserType(session.userType);
            setName(session.name || "");
            setPhone(session.phone || "");
            if (session.userType === "client") {
                setStep(2); // Start at step 2 (vehicle selection) for returning clients
            }
        }
        else {
            // For new users, start at step 0 (user type selection)
            setStep(0);
        }
        getLocationPermissionStatus().then(setLocationPermission).catch(() => setLocationPermission("unknown"));
    }, []);
    useEffect(() => {
        setCanAutoplay(true);
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const el = entry.target;
                if (!el)
                    return;
                if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
                    el.muted = true;
                    el.play().catch(() => { });
                }
                else {
                    el.pause();
                }
            });
        }, { threshold: [0.2, 0.5, 0.8] });
        if (carVideoRef.current)
            observer.observe(carVideoRef.current);
        if (homeVideoRef.current)
            observer.observe(homeVideoRef.current);
        return () => observer.disconnect();
    }, []);
    const handleUserTypeSelect = (type) => {
        setUserType(type);
        if (type === "cleaner") {
            rememberSession({ userType: "cleaner" });
        }
    };
    const handleGoBack = () => {
        // Handle navigation back from different steps
        if (step === 0) {
            // Going back from step 0 should return to user type selection
            clearUserSession();
            setUserType(null);
        }
        else if (step === 1) {
            // Going back from step 1 (account) should go to step 0 (user type selection)
            setStep(0);
        }
        else {
            // For other steps, go back normally
            setStep(step - 1);
        }
    };
    // Handle hardware back button for booking flow
    useEffect(() => {
        const handleStepBack = () => {
            // Prevent default back navigation if we're in a middle step
            if (step > 1) {
                // Call the same logic as the back button in the UI
                handleGoBack();
                // Stop propagation by returning false (handled by custom event system)
                return false;
            }
            // Return true if we allow default navigation (at step 1)
            return true;
        };
        const handleBookingStepBack = (e) => {
            const result = handleStepBack();
            // Since custom events can't return values directly, we'll use the event's defaultPrevented
            // to signal whether the event was handled
            if (!result) {
                e.preventDefault();
            }
        };
        document.addEventListener('booking:stepBack', handleBookingStepBack);
        return () => {
            document.removeEventListener('booking:stepBack', handleBookingStepBack);
        };
    }, [step, userType]);
    // Handle hardware back button for booking flow
    const rememberSession = (payload) => {
        saveUserSession({
            userType: payload.userType,
            name: payload.name || "",
            phone: payload.phone || "",
            lastSignedIn: new Date().toISOString(),
        });
    };
    const extrasEnabled = serviceCategory === "car-detailing";
    const stageDefinitions = useMemo(() => [
        { id: "account", label: "Account" },
        { id: "vehicle", label: "Vehicle" },
        { id: "package", label: "Package" },
        { id: "extras", label: "Add-ons", optional: true },
        { id: "schedule", label: "Schedule & Location" },
        { id: "review", label: "Review" },
    ], [serviceCategory]);
    const activeStages = useMemo(() => stageDefinitions.filter((stage) => extrasEnabled || stage.id !== "extras"), [stageDefinitions, extrasEnabled]);
    const currentStageId = useMemo(() => {
        if (step <= 1)
            return "account"; // Steps 0 and 1 map to account stage
        if (step === 2)
            return "vehicle";
        if (step === 3)
            return "package";
        if (step === 4)
            return "extras";
        if (step === 5)
            return "schedule";
        return "review";
    }, [step]);
    const currentStageIndex = activeStages.findIndex((stage) => stage.id === currentStageId);
    const normalizedStageIndex = currentStageIndex === -1 ? 0 : currentStageIndex;
    const progress = activeStages.length > 1
        ? Math.min(100, Math.max(0, ((Math.max(0, step - 1)) / (activeStages.length - 1)) * 100))
        : 0;
    const price = vehicleType && carServicePackage
        ? getCarDetailingPrice(vehicleType, carServicePackage, paintStage || undefined, midSUVTier, fleetCarCount)
        : 0;
    const carAddonsTotal = selectedCarExtras.reduce((total, extraId) => {
        const extra = CAR_DETAILING_EXTRAS.find((e) => e.id === extraId);
        return total + (extra?.price ?? 0);
    }, 0);
    const addonsTotal = carAddonsTotal;
    const totalPrice = price + addonsTotal;
    const PACKAGE_VIDEOS = {
        "NORMAL-DETAIL": "/assets/detailing/6873163-mobile-720p.mp4",
        "INTERIOR-STEAMING": "/assets/detailing/6873149-mobile-720p.mp4",
        "PAINT-CORRECTION": "/assets/detailing/6872065-mobile-720p.mp4",
        "FULL-DETAIL": "/assets/detailing/6872474-mobile-720p.mp4",
        "FLEET-PACKAGE": "",
    };
    const PACKAGE_FALLBACK_IMAGES = {
        "NORMAL-DETAIL": "/assets/images/premium-foam-wash.jpg",
        "INTERIOR-STEAMING": "/assets/detailing/wash-2.png",
        "PAINT-CORRECTION": "/assets/detailing/wash-1.png",
        "FULL-DETAIL": "/assets/detailing/IMG_0120.png",
        "FLEET-PACKAGE": "/assets/images/premium-foam-wash.jpg",
    };
    if (!userType) {
        return (_jsxs("div", { className: "w-full", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-2", children: "Complete Your Profile" }), _jsx("p", { className: "text-gray-600", children: "Tell us about yourself to get started" })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("p", { className: "font-semibold text-gray-900 mb-3", children: "I want to:" }), _jsx(Card, { variant: "outlined", hoverable: true, className: "p-6 cursor-pointer transition-all hover:border-gray-400", onClick: () => {
                                handleUserTypeSelect("client");
                                setStep(1); // Go to login page first
                            }, children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "text-3xl", children: "\uD83C\uDFE0" }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold text-xl text-gray-900 mb-1", children: "Find Professional Car Detailers" }), _jsx("p", { className: "text-sm text-gray-600", children: "Connect with expert detailers to elevate and maintain your vehicle" })] })] }) }), _jsx(Card, { variant: "outlined", hoverable: true, className: "p-6 cursor-pointer transition-all border-2 border-yellow-400 bg-yellow-50 hover:border-yellow-500", onClick: () => handleUserTypeSelect("cleaner"), children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "text-3xl", children: "\uD83D\uDCBC" }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold text-xl text-gray-900 mb-1", children: "Setup Personal Business" }), _jsx("p", { className: "text-sm text-gray-600", children: "Offer cleaning services and grow your business" })] })] }) })] })] }));
    }
    if (userType === "cleaner") {
        return (_jsxs("div", { children: [_jsxs("button", { onClick: () => setUserType(null), className: "text-gray-600 hover:text-gray-900 mb-6 flex items-center gap-2", children: [_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }), "Back"] }), _jsx(CleanerProfile, {})] }));
    }
    const handleGetLocation = async () => {
        setIsLoadingLocation(true);
        const loc = await getCurrentLocation();
        setIsLoadingLocation(false);
        if (loc) {
            setLocation(loc);
        }
        else {
            toast.error("Could not fetch location. Please enter manually.");
        }
    };
    const handleLocationChange = async (lat, lng) => {
        // Update coordinates immediately for responsiveness
        setLocation((prev) => ({
            ...prev,
            coordinates: [lat, lng],
        }));
        try {
            // Reverse geocode to get the new address
            const address = await reverseGeocode(lat, lng);
            setLocation((prev) => ({
                ...prev,
                coordinates: [lat, lng],
                address: address,
                manualAddress: address
            }));
        }
        catch (error) {
            console.error("Failed to reverse geocode:", error);
        }
    };
    const handleBookingSubmit = async () => {
        try {
            setIsSubmitting(true);
            const bookingPayload = {
                contact: {
                    name: name.trim() || "CleanCloak Client",
                    phone,
                },
                serviceCategory,
                vehicleType: serviceCategory === "car-detailing" ? vehicleType : undefined,
                carServicePackage: serviceCategory === "car-detailing" ? carServicePackage : undefined,
                paintCorrectionStage: carServicePackage === "PAINT-CORRECTION" ? paintStage : undefined,
                midSUVPricingTier: vehicleType === "MID-SUV" ? midSUVTier : undefined,
                fleetCarCount: carServicePackage === "FLEET-PACKAGE" ? fleetCarCount : undefined,
                selectedCarExtras: selectedCarExtras.length > 0 ? selectedCarExtras : undefined,
                location,
                bookingType,
                scheduledDate: bookingType === "scheduled" ? scheduledDate : undefined,
                scheduledTime: bookingType === "scheduled" ? scheduledTime : undefined,
                paymentMethod,
                price: totalPrice,
                paymentStatus: "pending",
            };
            const response = await api.post("/bookings/public", bookingPayload);
            if (!response.ok) {
                let errorMessage = "Failed to submit booking";
                try {
                    const errorBody = await response.json().catch(() => ({}));
                    errorMessage = errorBody.message || errorBody.error || errorMessage;
                }
                catch (e) {
                    // If JSON parsing fails, try to get text
                    try {
                        const errorText = await response.text();
                        if (errorText) {
                            errorMessage = errorText.substring(0, 200);
                        }
                    }
                    catch (textError) {
                        // Use default error message
                    }
                }
                throw new Error(errorMessage);
            }
            const data = await response.json();
            const bookingRecord = data.booking || bookingPayload;
            rememberSession({
                userType: "client",
                name: name.trim() || bookingRecord.contact?.name,
                phone,
            });
            toast.success("🎉 Booking created! A cleaner will accept your request soon.");
            setTimeout(() => {
                setStep(2);
                setName("");
                setPhone("");
                setVehicleType("");
                setCarServicePackage("");
                setPaintStage("");
                setMidSUVTier("STANDARD");
                setFleetCarCount(5);
                setSelectedCarExtras([]);
            }, 1000);
        }
        catch (error) {
            console.error("Booking submission error:", error);
            const errorMessage = error?.message || error?.toString() || "Failed to submit booking. Please check your connection and try again.";
            // Check if it's a network error
            if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('Failed to fetch')) {
                toast.error("Network error. Please check your internet connection and try again.");
            }
            else {
                toast.error(errorMessage);
            }
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsxs("div", { className: "w-full min-h-screen min-w-full mx-auto m-0 p-0 pb-32 bg-white overflow-x-hidden", children: [_jsxs("div", { className: "mb-6 bg-gradient-to-br from-gray-900 via-gray-950 to-black shadow-lg border-b border-gray-800 backdrop-blur-sm -mx-4 px-4 pt-6 pb-8", children: [step > 0 && (_jsxs("button", { onClick: handleGoBack, className: "text-gray-300 hover:text-white mb-2 flex items-center gap-2 font-medium px-0", children: [_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }), "Back"] })), _jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-4xl font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent mb-2", children: "CleanCloak" }), _jsxs("p", { className: "text-gray-100 font-medium text-lg", children: [step === 0 && "Complete your profile to get started", step === 1 &&
                                        (isSignup
                                            ? "Create your account to find professional car detailers"
                                            : "Sign in to find professional car detailers"), step === 2 && "Select vehicle type", step === 3 && "Select service package", step === 4 && "Select add-ons", step === 5 && "Location & scheduling", step === 6 && "Review your booking"] })] })] }), step === 0 && (_jsxs("div", { className: "w-full max-w-2xl mx-auto px-4", children: [_jsx("div", { className: "text-center mb-8" }), _jsxs("div", { className: "space-y-4", children: [_jsx("p", { className: "font-semibold text-gray-100 mb-3", children: "I want to:" }), _jsx(Card, { variant: "outlined", hoverable: true, className: "p-6 cursor-pointer transition-all hover:border-yellow-400 shadow-sm hover:shadow-md", onClick: () => {
                                    handleUserTypeSelect("client");
                                    setStep(1); // Go to login/signup page
                                }, children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-2xl", children: "\uD83D\uDE97" }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-bold text-xl text-gray-900 mb-1", children: "Find Professional Car Detailers" }), _jsx("p", { className: "text-sm text-gray-600", children: "Connect with expert detailers to elevate and maintain your vehicle" })] }), _jsx("div", { className: "flex-shrink-0 text-yellow-500", children: "\u203A" })] }) }), _jsx(Card, { variant: "outlined", hoverable: true, className: "p-6 cursor-pointer transition-all border-2 border-yellow-400 bg-yellow-50 hover:border-yellow-500 shadow-sm hover:shadow-md", onClick: () => handleUserTypeSelect("cleaner"), children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-white text-2xl", children: "\uD83D\uDCBC" }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-bold text-xl text-gray-900 mb-1", children: "Join the Clean Cloak Family or Login" }), _jsx("p", { className: "text-sm text-gray-600", children: "Offer Premium Detailing Services" })] }), _jsx("div", { className: "flex-shrink-0 text-yellow-500", children: "\u203A" })] }) })] })] })), step === 1 && (_jsxs("div", { className: "space-y-6 w-full max-w-2xl mx-auto px-4", children: [_jsxs("div", { className: "space-y-3 mb-6 bg-gray-800/90 backdrop-blur-lg rounded-2xl border border-gray-700 shadow-sm -mx-4 px-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h3", { className: "font-semibold text-gray-100", children: "Booking Progress" }), _jsxs("span", { className: "text-sm font-medium text-amber-400 bg-amber-900/50 px-3 py-1 rounded-full", children: ["Step ", normalizedStageIndex + 1, " of ", activeStages.length] })] }), _jsx(ProgressBar, { value: progress, className: "mb-3" }), _jsx("div", { className: "flex gap-2 overflow-x-auto pb-2", children: activeStages.map((stage, index) => {
                                    const status = index < normalizedStageIndex
                                        ? "complete"
                                        : index === normalizedStageIndex
                                            ? "current"
                                            : "upcoming";
                                    const statusClasses = status === "complete"
                                        ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 shadow-lg"
                                        : status === "current"
                                            ? "border-2 border-yellow-500 shadow-md bg-gradient-to-r from-yellow-50 to-white"
                                            : "border border-gray-200 bg-white shadow-sm text-gray-400";
                                    return (_jsx("button", { className: `px-4 py-2.5 text-sm font-semibold rounded-xl whitespace-nowrap transition-all duration-300 transform hover:scale-105 ${statusClasses}`, onClick: () => setStep(index + 1), disabled: index > normalizedStageIndex, children: _jsxs("div", { className: "flex items-center gap-2", children: [status === "complete" && (_jsx("svg", { className: "w-4 h-4", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z", clipRule: "evenodd" }) })), stage.label] }) }, stage.id));
                                }) })] }), _jsxs("div", { className: "space-y-4", children: [isSignup && (_jsx(Input, { label: "Full Name", placeholder: "e.g. John Kamau", value: name, onChange: (e) => setName(e.target.value), required: true })), _jsx(Input, { label: "Phone Number", placeholder: "07XX XXX XXX (for M-Pesa payments)", value: phone, onChange: (e) => setPhone(formatPhoneNumber(e.target.value)), required: true, helperText: "Use your Safaricom number registered for M-Pesa (07XXXXXXXX or 01XXXXXXXX)" }), _jsx(Input, { label: "Password", type: "password", placeholder: "Enter your password", value: password, onChange: (e) => setPassword(e.target.value), required: true, helperText: "Minimum 6 characters" })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3 mt-6 w-full", children: [_jsx(Button, { loading: isAuthenticating, disabled: isAuthenticating || !phone || (isSignup && (!name || !password)), onClick: async () => {
                                    if (!phone) {
                                        toast.error("Please enter a phone number");
                                        return;
                                    }
                                    if (isSignup && !name.trim()) {
                                        toast.error("Please enter your name");
                                        return;
                                    }
                                    if (!password) {
                                        toast.error("Please enter a password");
                                        return;
                                    }
                                    setIsAuthenticating(true);
                                    try {
                                        if (isSignup) {
                                            // Sign up flow
                                            console.log('Attempting to register with:', { name: name.trim(), phone, role: "client" });
                                            const result = await authAPI.register({
                                                name: name.trim(),
                                                phone,
                                                password,
                                                role: "client",
                                            });
                                            console.log('Registration result:', result);
                                            if (result.success) {
                                                toast.success("Account created successfully!");
                                                // Save user session after successful signup
                                                saveUserSession({
                                                    userType: "client",
                                                    name: name.trim(),
                                                    phone,
                                                    lastSignedIn: new Date().toISOString(),
                                                });
                                                // Set user type and move to next step
                                                setUserType("client");
                                                setStep(2);
                                            }
                                            else {
                                                throw new Error(result.message || "Failed to create account");
                                            }
                                        }
                                        else {
                                            // Login flow with phone and password
                                            console.log('Attempting to login with:', { phone, password });
                                            const result = await authAPI.login(phone, password);
                                            console.log('Login result:', result);
                                            if (result.success) {
                                                toast.success("Logged in successfully!");
                                                // Save user session after successful login
                                                saveUserSession({
                                                    userType: "client",
                                                    name: result.user?.name || name,
                                                    phone,
                                                    lastSignedIn: new Date().toISOString(),
                                                });
                                                // Set user type and move to next step
                                                setUserType("client");
                                                setStep(2);
                                            }
                                            else {
                                                throw new Error(result.message || "Failed to login");
                                            }
                                        }
                                    }
                                    catch (error) {
                                        console.error('Auth error:', error);
                                        toast.error(error.message || "An error occurred. Please check your connection.");
                                    }
                                    finally {
                                        setIsAuthenticating(false);
                                    }
                                }, fullWidth: true, className: "min-h-12", children: isSignup ? "Create Account" : "Sign In" }), _jsx(Button, { variant: "ghost", onClick: () => setIsSignup(!isSignup), fullWidth: true, className: "min-h-12", children: isSignup
                                    ? "Already have an account? Sign In"
                                    : "Don't have an account? Sign Up" })] })] })), step === 2 && (_jsxs("div", { className: "space-y-6 w-full max-w-2xl mx-auto px-4", children: [_jsxs("div", { className: "space-y-3 mb-6 p-5 bg-gray-800/90 backdrop-blur-lg rounded-2xl border border-gray-700 shadow-sm", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h3", { className: "font-semibold text-gray-100", children: "Booking Progress" }), _jsxs("span", { className: "text-sm font-medium text-amber-400 bg-amber-900/50 px-3 py-1 rounded-full", children: ["Step ", normalizedStageIndex + 1, " of ", activeStages.length] })] }), _jsx(ProgressBar, { value: progress, className: "mb-3" }), _jsx("div", { className: "flex gap-2 overflow-x-auto pb-2", children: activeStages.map((stage, index) => {
                                    const status = index < normalizedStageIndex
                                        ? "complete"
                                        : index === normalizedStageIndex
                                            ? "current"
                                            : "upcoming";
                                    const statusClasses = status === "complete"
                                        ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 shadow-lg"
                                        : status === "current"
                                            ? "border-2 border-yellow-500 shadow-md bg-gradient-to-r from-yellow-50 to-white"
                                            : "border border-gray-200 bg-white shadow-sm text-gray-400";
                                    return (_jsx("button", { className: `px-4 py-2.5 text-sm font-semibold rounded-xl whitespace-nowrap transition-all duration-300 transform hover:scale-105 ${statusClasses}`, onClick: () => setStep(index + 1), disabled: index > normalizedStageIndex, children: _jsxs("div", { className: "flex items-center gap-2", children: [status === "complete" && (_jsx("svg", { className: "w-4 h-4", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z", clipRule: "evenodd" }) })), stage.label] }) }, stage.id));
                                }) })] }), _jsxs("div", { className: "relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 aspect-video max-h-[320px] w-full flex items-center justify-center mb-4 shadow-inner max-w-2xl mx-auto", children: [_jsxs("video", { ref: carVideoRef, src: getVideoSrc('/assets/detailing/6873165-mobile-720p.mp4'), muted: true, loop: true, playsInline: true, autoPlay: true, preload: "metadata", className: "w-full h-full object-cover rounded-lg", onError: (e) => {
                                    console.error('Video failed to load:', e.currentTarget.src);
                                    // Set a state to show fallback image when video fails
                                    setVehicleVideoFailed(true);
                                }, children: [_jsx("track", { kind: "captions" }), "Your browser does not support the video tag."] }), vehicleVideoFailed && (_jsx("img", { src: "/assets/detailing/wash-1.png", alt: "Vehicle selection", className: "absolute inset-0 w-full h-full object-cover rounded-lg max-w-2xl mx-auto" })), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" })] }), _jsx("div", { className: "space-y-4 w-full max-w-lg mx-auto", children: VEHICLE_CATEGORIES.map((vehicle) => {
                            const status = vehicleType === vehicle.id
                                ? "current"
                                : "upcoming";
                            const _statusClasses = status === "current"
                                ? "border-2 border-yellow-400 shadow-sm"
                                : "border border-gray-200 opacity-60";
                            return (_jsx(Card, { variant: "glass", hoverable: true, selected: vehicleType === vehicle.id, className: `p-5 cursor-pointer transition-all duration-300 transform hover:scale-[1.03] border-2 ${vehicleType === vehicle.id ? 'border-yellow-500 shadow-2xl ring-2 ring-yellow-200' : 'border-gray-200 shadow-lg hover:shadow-xl'} rounded-2xl`, onClick: () => {
                                    setVehicleType(vehicle.id);
                                    // Auto-progress to next step
                                    setStep(3);
                                }, children: _jsxs("div", { className: "flex items-center gap-5", children: [_jsx("div", { className: "flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-2xl shadow-md", children: vehicle.icon }), _jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-bold text-gray-900 text-xl", children: vehicle.name }), _jsx("p", { className: "text-sm text-gray-600 mt-1.5", children: vehicle.description })] }), _jsx("div", { className: "flex-shrink-0 text-yellow-500", children: _jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }) })] }) }, vehicle.id));
                        }) }), _jsx("div", { className: "flex flex-col sm:flex-row gap-3 mt-6", children: _jsx(Button, { variant: "outline", onClick: handleGoBack, fullWidth: true, children: "Back" }) })] })), step === 3 && (_jsxs("div", { className: "space-y-6 w-full max-w-2xl mx-auto px-4", children: [_jsxs("div", { className: "space-y-3 mb-6 p-5 bg-gray-800/90 backdrop-blur-lg rounded-2xl border border-gray-700 shadow-sm", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h3", { className: "font-semibold text-gray-100", children: "Booking Progress" }), _jsxs("span", { className: "text-sm font-medium text-amber-400 bg-amber-900/50 px-3 py-1 rounded-full", children: ["Step ", normalizedStageIndex + 1, " of ", activeStages.length] })] }), _jsx(ProgressBar, { value: progress, className: "mb-3" }), _jsx("div", { className: "flex gap-2 overflow-x-auto pb-2", children: activeStages.map((stage, index) => {
                                    const status = index < normalizedStageIndex
                                        ? "complete"
                                        : index === normalizedStageIndex
                                            ? "current"
                                            : "upcoming";
                                    const statusClasses = status === "complete"
                                        ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 shadow-lg"
                                        : status === "current"
                                            ? "border-2 border-yellow-500 shadow-md bg-gradient-to-r from-yellow-50 to-white"
                                            : "border border-gray-200 bg-white shadow-sm text-gray-400";
                                    return (_jsx("button", { className: `px-4 py-2.5 text-sm font-semibold rounded-xl whitespace-nowrap transition-all duration-300 transform hover:scale-105 ${statusClasses}`, onClick: () => setStep(index + 1), disabled: index > normalizedStageIndex, children: _jsxs("div", { className: "flex items-center gap-2", children: [status === "complete" && (_jsx("svg", { className: "w-4 h-4", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z", clipRule: "evenodd" }) })), stage.label] }) }, stage.id));
                                }) })] }), _jsx("div", { className: "space-y-5 w-full", children: CAR_SERVICE_PACKAGES.map((pkg) => {
                            let displayPrice = getCarDetailingPrice(vehicleType, pkg.id, paintStage || undefined, midSUVTier, fleetCarCount);
                            if (pkg.id === "PAINT-CORRECTION") {
                                // For paint correction package card, always show Stage 1 price
                                displayPrice = getCarDetailingPrice(vehicleType, pkg.id, "STAGE-1", midSUVTier, fleetCarCount);
                            }
                            const status = carServicePackage === pkg.id
                                ? "current"
                                : "upcoming";
                            const _statusClasses = status === "current"
                                ? "border-2 border-yellow-400 shadow-sm"
                                : "border border-gray-200 opacity-60";
                            return (_jsxs(Card, { variant: "glass", hoverable: true, selected: carServicePackage === pkg.id, className: `p-5 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] border-2 ${carServicePackage === pkg.id ? 'border-indigo-500 shadow-2xl ring-2 ring-indigo-200' : 'border-gray-200 shadow-lg hover:shadow-xl'} rounded-2xl`, onClick: () => {
                                    setCarServicePackage(pkg.id);
                                    // Auto-progress if not a special package that requires additional selections
                                    if (pkg.id !== "PAINT-CORRECTION" && pkg.id !== "FLEET-PACKAGE") {
                                        setStep(4);
                                    }
                                    else {
                                        // For special packages, allow user to configure additional options before advancing
                                        if (pkg.id === "PAINT-CORRECTION") {
                                            // User needs to select paint correction stage
                                        }
                                        else if (pkg.id === "FLEET-PACKAGE") {
                                            // User needs to select number of cars
                                        }
                                    }
                                }, children: [_jsx("div", { className: "-mt-1 -mx-1 mb-2", children: pkg.id !== "FLEET-PACKAGE" && ( // Don't show media for fleet package
                                        PACKAGE_VIDEOS[pkg.id] && !failedPackage[pkg.id] ? (_jsxs("div", { className: "bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg overflow-hidden shadow-lg relative aspect-video max-h-[220px] w-full border border-indigo-100 max-w-2xl mx-auto", children: [_jsx("video", { className: "w-full h-full object-cover", src: getVideoSrc(PACKAGE_VIDEOS[pkg.id]), muted: true, loop: true, playsInline: true, preload: "none", autoPlay: true, poster: PACKAGE_FALLBACK_IMAGES[pkg.id], onError: () => setFailedPackage((p) => ({ ...p, [pkg.id]: true })) }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" })] })) : PACKAGE_FALLBACK_IMAGES[pkg.id] ? (_jsxs("div", { className: "bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg overflow-hidden shadow-lg relative aspect-video max-h-[220px] w-full border border-indigo-100 max-w-2xl mx-auto", children: [_jsx("img", { src: PACKAGE_FALLBACK_IMAGES[pkg.id], alt: pkg.name, className: "w-full h-full object-cover", loading: "lazy" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" })] })) : null) }), _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-bold text-gray-900 text-base", children: pkg.name }), _jsx("p", { className: "text-xs text-gray-600 mt-1", children: pkg.description }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: pkg.duration })] }), _jsx("div", { className: "flex flex-col items-end", children: _jsx("span", { className: "font-bold text-yellow-600 min-w-[140px] text-right whitespace-nowrap", children: pkg.id === "FLEET-PACKAGE"
                                                        ? formatCurrency(displayPrice)
                                                        : pkg.id === "PAINT-CORRECTION"
                                                            ? (displayPrice > 0 ? formatCurrency(displayPrice) : `KSH 5,000`)
                                                            : formatCurrency(displayPrice) }) })] })] }, pkg.id));
                        }) }), carServicePackage === "PAINT-CORRECTION" && (_jsxs("div", { className: "mt-6 p-5 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl shadow-sm", children: [_jsx("p", { className: "font-semibold text-gray-900 mb-3", children: "Select Paint Correction Stage:" }), _jsx("div", { className: "grid gap-3", children: PAINT_CORRECTION_STAGES.map((stage) => {
                                    const stagePrice = getCarDetailingPrice(vehicleType, "PAINT-CORRECTION", stage.id, midSUVTier);
                                    return (_jsx(Card, { variant: "elevated", hoverable: true, selected: paintStage === stage.id, className: `py-3 px-3 cursor-pointer border-2 ${paintStage === stage.id ? 'border-indigo-500 shadow-xl ring-2 ring-indigo-200' : 'border-indigo-200 shadow-md hover:shadow-lg'} rounded-xl transition-all duration-300`, onClick: () => setPaintStage(stage.id), children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h5", { className: "font-semibold text-gray-900 text-sm", children: stage.name }), _jsx("p", { className: "text-xs text-gray-600", children: stage.description })] }), _jsx("span", { className: "font-bold text-yellow-600", children: formatCurrency(stagePrice) })] }) }, stage.id));
                                }) })] })), carServicePackage === "FLEET-PACKAGE" && (_jsxs("div", { className: "mt-6 p-6 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl shadow-sm", children: [_jsx("p", { className: "font-semibold text-gray-900 mb-3", children: "Number of Cars:" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { type: "button", onClick: () => setFleetCarCount((prev) => Math.max(2, prev - 1)), className: "w-12 h-12 rounded-full bg-gradient-to-b from-indigo-50 to-white border border-indigo-200 flex items-center justify-center text-xl font-bold hover:from-indigo-100 active:scale-95 transition-all duration-300 shadow-sm hover:shadow-md", children: "-" }), _jsx("div", { className: "flex-1 text-center", children: _jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Login to CleanCloak" }) }), _jsx("button", { type: "button", onClick: () => setFleetCarCount((prev) => Math.min(100, prev + 1)), className: "w-12 h-12 rounded-full bg-gradient-to-b from-indigo-50 to-white border border-indigo-200 flex items-center justify-center text-xl font-bold hover:from-indigo-100 active:scale-95 transition-all duration-300 shadow-sm hover:shadow-md", children: "+" })] }), _jsxs("p", { className: "text-sm text-gray-600 mt-2 text-center", children: ["Total: ", formatCurrency(getCarDetailingPrice(vehicleType, "FLEET-PACKAGE", undefined, midSUVTier, fleetCarCount))] })] })), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3 mt-6", children: [_jsx(Button, { variant: "outline", onClick: () => setStep(2), fullWidth: true, children: "Back" }), _jsx(Button, { onClick: () => {
                                    // For paint correction, user must select a stage
                                    if (carServicePackage === "PAINT-CORRECTION" && !paintStage) {
                                        toast.error("Please select a paint correction stage");
                                        return;
                                    }
                                    // For fleet package, user must select number of cars
                                    if (carServicePackage === "FLEET-PACKAGE" && fleetCarCount < 2) {
                                        toast.error("Please select at least 2 cars for fleet package");
                                        return;
                                    }
                                    setStep(4);
                                }, fullWidth: true, disabled: !carServicePackage, children: "Continue" })] })] })), step === 4 && (_jsxs("div", { className: "space-y-6 w-full max-w-2xl mx-auto px-4", children: [_jsxs("div", { className: "space-y-3 mb-6 p-5 bg-gray-800/90 backdrop-blur-lg rounded-2xl border border-gray-700 shadow-sm", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h3", { className: "font-semibold text-gray-100", children: "Booking Progress" }), _jsxs("span", { className: "text-sm font-medium text-amber-400 bg-amber-900/50 px-3 py-1 rounded-full", children: ["Step ", normalizedStageIndex + 1, " of ", activeStages.length] })] }), _jsx(ProgressBar, { value: progress, className: "mb-3" }), _jsx("div", { className: "flex gap-2 overflow-x-auto pb-2", children: activeStages.map((stage, index) => {
                                    const status = index < normalizedStageIndex
                                        ? "complete"
                                        : index === normalizedStageIndex
                                            ? "current"
                                            : "upcoming";
                                    const statusClasses = status === "complete"
                                        ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 shadow-lg"
                                        : status === "current"
                                            ? "border-2 border-yellow-500 shadow-md bg-gradient-to-r from-yellow-50 to-white"
                                            : "border border-gray-200 bg-white shadow-sm text-gray-400";
                                    return (_jsx("button", { className: `px-4 py-2.5 text-sm font-semibold rounded-xl whitespace-nowrap transition-all duration-300 transform hover:scale-105 ${statusClasses}`, onClick: () => setStep(index + 1), disabled: index > normalizedStageIndex, children: _jsxs("div", { className: "flex items-center gap-2", children: [status === "complete" && (_jsx("svg", { className: "w-4 h-4", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z", clipRule: "evenodd" }) })), stage.label] }) }, stage.id));
                                }) })] }), _jsxs("div", { className: "mb-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Selected Package:" }), _jsxs("div", { className: "flex items-center gap-3 mt-1 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200", children: [_jsx("span", { className: "text-xl", children: "\u2728" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-bold text-gray-900", children: CAR_SERVICE_PACKAGES.find(p => p.id === carServicePackage)?.name }), _jsx("p", { className: "text-xs text-gray-600", children: VEHICLE_CATEGORIES.find(v => v.id === vehicleType)?.name })] }), _jsx("button", { onClick: () => setStep(3), className: "ml-auto text-xs text-yellow-600 font-bold hover:underline", children: "Change" })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Select Additional Services" }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Choose specific detailing services you need" })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-3", children: "Optional Extras" }), _jsx("div", { className: "space-y-3 w-full max-w-lg mx-auto", children: CAR_DETAILING_EXTRAS.map((extra) => {
                                    const isSelected = selectedCarExtras.includes(extra.id);
                                    return (_jsxs("label", { className: "flex items-center justify-between p-3 bg-white rounded border cursor-pointer hover:border-yellow-400", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { type: "checkbox", checked: isSelected, onChange: (e) => {
                                                            if (e.target.checked) {
                                                                setSelectedCarExtras([
                                                                    ...selectedCarExtras,
                                                                    extra.id,
                                                                ]);
                                                            }
                                                            else {
                                                                setSelectedCarExtras(selectedCarExtras.filter((id) => id !== extra.id));
                                                            }
                                                        }, className: "w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500" }), _jsx("span", { children: extra.name })] }), _jsx("span", { className: "font-semibold text-yellow-600 w-28 text-left whitespace-nowrap", children: formatCurrency(extra.price) })] }, extra.id));
                                }) })] }), selectedCarExtras.length > 0 && (_jsxs("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4", children: [_jsxs("p", { className: "text-sm font-medium text-gray-900 mb-2", children: ["Selected Extras (", selectedCarExtras.length, ")"] }), _jsx("div", { className: "flex flex-wrap gap-2", children: selectedCarExtras.map((extraId) => {
                                    const extra = CAR_DETAILING_EXTRAS.find((e) => e.id === extraId);
                                    return extra ? (_jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-1 bg-white border border-yellow-300 rounded text-xs", children: [extra.icon, " ", extra.name] }, extraId)) : null;
                                }) }), _jsxs("p", { className: "mt-3 text-sm text-gray-700", children: ["Extras total:", " ", _jsx("span", { className: "font-semibold text-yellow-700", children: formatCurrency(addonsTotal) })] })] })), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3 mt-6 w-full", children: [_jsx(Button, { variant: "outline", onClick: () => setStep(3), fullWidth: true, className: "min-h-12", children: "Back" }), _jsxs(Button, { onClick: () => {
                                    // For fleet package, user must select number of cars
                                    if (carServicePackage === "FLEET-PACKAGE" && fleetCarCount < 2) {
                                        toast.error("Please select at least 2 cars for fleet package");
                                        return;
                                    }
                                    setStep(5);
                                }, fullWidth: true, className: "min-h-12", children: ["Continue", selectedCarExtras.length > 0 &&
                                        `(${selectedCarExtras.length} extras)`] })] })] })), step === 5 && (_jsxs("div", { className: "space-y-6 w-full max-w-2xl mx-auto px-4", children: [_jsxs("div", { className: "space-y-3 mb-6 p-5 bg-gray-800/90 backdrop-blur-lg rounded-2xl border border-gray-700 shadow-sm", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h3", { className: "font-semibold text-gray-100", children: "Booking Progress" }), _jsxs("span", { className: "text-sm font-medium text-amber-400 bg-amber-900/50 px-3 py-1 rounded-full", children: ["Step ", normalizedStageIndex + 1, " of ", activeStages.length] })] }), _jsx(ProgressBar, { value: progress, className: "mb-3" }), _jsx("div", { className: "flex gap-2 overflow-x-auto pb-2", children: activeStages.map((stage, index) => {
                                    const status = index < normalizedStageIndex
                                        ? "complete"
                                        : index === normalizedStageIndex
                                            ? "current"
                                            : "upcoming";
                                    const statusClasses = status === "complete"
                                        ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 shadow-lg"
                                        : status === "current"
                                            ? "border-2 border-yellow-500 shadow-md bg-gradient-to-r from-yellow-50 to-white"
                                            : "border border-gray-200 bg-white shadow-sm text-gray-400";
                                    return (_jsx("button", { className: `px-4 py-2.5 text-sm font-semibold rounded-xl whitespace-nowrap transition-all duration-300 transform hover:scale-105 ${statusClasses}`, onClick: () => setStep(index + 1), disabled: index > normalizedStageIndex, children: _jsxs("div", { className: "flex items-center gap-2", children: [status === "complete" && (_jsx("svg", { className: "w-4 h-4", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z", clipRule: "evenodd" }) })), stage.label] }) }, stage.id));
                                }) })] }), _jsxs("div", { className: "w-full", children: [_jsx("p", { className: "font-semibold text-gray-900 mb-3", children: "Location:" }), _jsx(Button, { variant: "outline", fullWidth: true, onClick: handleGetLocation, loading: isLoadingLocation, className: "mb-3", children: "\uD83D\uDCCD Use Current Location" }), _jsxs("p", { className: "text-xs text-gray-600 mb-2", children: ["Permission: ", locationPermission] }), _jsx(Input, { placeholder: "Or enter address manually", value: location.manualAddress || "", onChange: (e) => setLocation({ ...location, manualAddress: e.target.value }) }), _jsx(LocationMap, { location: location, height: "200px", draggable: true, onLocationChange: handleLocationChange, showMap: false }), (location.address || location.manualAddress || location.coordinates) && (_jsxs("div", { className: "mt-4 space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-xs font-bold text-gray-500 uppercase tracking-wider", children: "Location" }), _jsx("button", { onClick: () => setLocation({}), className: "text-xs text-red-500 font-bold hover:underline", children: "Clear" })] }), location.address && (_jsxs("div", { className: "p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2", children: [_jsx("span", { className: "text-blue-500 mt-0.5", children: "\uD83D\uDCCD" }), _jsx("p", { className: "text-sm text-blue-900 font-medium", children: location.address })] }))] }))] }), _jsxs("div", { className: "w-full", children: [_jsx("p", { className: "font-semibold text-gray-900 mb-3", children: "When do you need this service?" }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs(Card, { variant: bookingType === "immediate" ? "default" : "outlined", hoverable: true, selected: bookingType === "immediate", className: "p-4 cursor-pointer text-center", onClick: () => setBookingType("immediate"), children: [_jsx("div", { className: "text-2xl mb-2", children: "\u26A1" }), _jsx("p", { className: "font-semibold text-sm", children: "Now" })] }), _jsxs(Card, { variant: bookingType === "scheduled" ? "default" : "outlined", hoverable: true, selected: bookingType === "scheduled", className: "p-4 cursor-pointer text-center", onClick: () => setBookingType("scheduled"), children: [_jsx("div", { className: "text-2xl mb-2", children: "\uD83D\uDCC5" }), _jsx("p", { className: "font-semibold text-sm", children: "Schedule" })] })] })] }), bookingType === "scheduled" && (_jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx(Input, { type: "date", label: "Date", value: scheduledDate, onChange: (e) => setScheduledDate(e.target.value) }), _jsx(Input, { type: "time", label: "Time", value: scheduledTime, onChange: (e) => setScheduledTime(e.target.value) })] })), _jsxs("div", { className: "w-full", children: [_jsx("p", { className: "font-semibold text-gray-900 mb-3", children: "Payment Method:" }), _jsxs(Card, { variant: "default", className: "p-4 text-center bg-green-50 border-green-200", children: [_jsxs("div", { className: "flex items-center justify-center gap-2", children: [_jsx("span", { className: "text-2xl", children: "\uD83D\uDCF1" }), _jsx("p", { className: "font-bold text-lg text-green-800", children: "M-PESA" })] }), _jsx("p", { className: "text-xs text-gray-600 mt-1", children: "Secure mobile payment" })] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3 mt-6 w-full", children: [_jsx(Button, { variant: "outline", onClick: () => setStep(4), fullWidth: true, className: "min-h-12", children: "Back" }), _jsx(Button, { onClick: () => setStep(6), fullWidth: true, className: "min-h-12", children: "Review" })] })] })), step === 6 && (_jsxs("div", { className: "space-y-6 w-full max-w-2xl mx-auto px-4", children: [_jsxs("div", { className: "space-y-3 mb-6 p-5 bg-gray-800/90 backdrop-blur-lg rounded-2xl border border-gray-700 shadow-sm", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h3", { className: "font-semibold text-gray-100", children: "Booking Progress" }), _jsxs("span", { className: "text-sm font-medium text-amber-400 bg-amber-900/50 px-3 py-1 rounded-full", children: ["Step ", normalizedStageIndex + 1, " of ", activeStages.length] })] }), _jsx(ProgressBar, { value: progress, className: "mb-3" }), _jsx("div", { className: "flex gap-2 overflow-x-auto pb-2", children: activeStages.map((stage, index) => {
                                    const status = index < normalizedStageIndex
                                        ? "complete"
                                        : index === normalizedStageIndex
                                            ? "current"
                                            : "upcoming";
                                    const statusClasses = status === "complete"
                                        ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 shadow-lg"
                                        : status === "current"
                                            ? "border-2 border-yellow-500 shadow-md bg-gradient-to-r from-yellow-50 to-white"
                                            : "border border-gray-200 bg-white shadow-sm text-gray-400";
                                    return (_jsx("button", { className: `px-4 py-2.5 text-sm font-semibold rounded-xl whitespace-nowrap transition-all duration-300 transform hover:scale-105 ${statusClasses}`, onClick: () => setStep(index + 1), disabled: index > normalizedStageIndex, children: _jsxs("div", { className: "flex items-center gap-2", children: [status === "complete" && (_jsx("svg", { className: "w-4 h-4", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z", clipRule: "evenodd" }) })), stage.label] }) }, stage.id));
                                }) })] }), _jsxs(Card, { className: "p-4 sm:p-6 bg-gray-50", children: [_jsx("h3", { className: "font-bold text-lg mb-4", children: "Booking Summary" }), _jsxs("div", { className: "space-y-3 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Service:" }), _jsx("span", { className: "font-semibold", children: "Car Detailing" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Location:" }), _jsx("span", { className: "font-semibold text-right", children: location.address || location.manualAddress || (location.coordinates ?
                                                    `${location.coordinates[0].toFixed(4)}, ${location.coordinates[1].toFixed(4)}` :
                                                    'No location set') })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Type:" }), _jsx("span", { className: "font-semibold", children: VEHICLE_CATEGORIES.find((v) => v.id === vehicleType)
                                                    ?.name })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Package:" }), _jsx("span", { className: "font-semibold", children: CAR_SERVICE_PACKAGES.find((s) => s.id === carServicePackage)?.name })] }), selectedCarExtras.length > 0 && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Add-ons:" }), _jsx("div", { className: "mt-1 flex flex-wrap gap-2", children: selectedCarExtras.map((id) => {
                                                    const addon = CAR_DETAILING_EXTRAS.find((s) => s.id === id);
                                                    return addon ? (_jsx("span", { className: "text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-700", children: addon.name }, id)) : null;
                                                }) })] })), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "When:" }), _jsx("span", { className: "font-semibold", children: bookingType === "immediate"
                                                    ? "Now"
                                                    : `${scheduledDate} at ${scheduledTime}` })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Payment:" }), _jsx("span", { className: "font-semibold uppercase", children: paymentMethod })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Base Price:" }), _jsx("span", { className: "font-semibold", children: formatCurrency(price) })] }), addonsTotal > 0 && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Add-ons Total:" }), _jsx("span", { className: "font-semibold", children: formatCurrency(addonsTotal) })] })), _jsxs("div", { className: "border-t pt-3 flex justify-between text-lg", children: [_jsx("span", { className: "font-bold", children: "Total:" }), _jsx("span", { className: "font-bold text-yellow-600", children: formatCurrency(totalPrice) })] })] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3 w-full", children: [_jsx(Button, { variant: "outline", onClick: () => setStep(5), fullWidth: true, className: "min-h-12", children: "Back" }), _jsx(Button, { fullWidth: true, onClick: handleBookingSubmit, disabled: isSubmitting, className: "min-h-12 mt-4", children: isSubmitting ? "Submitting..." : "Confirm Booking" })] })] }))] }));
}
