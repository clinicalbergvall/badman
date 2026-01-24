import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Button, Card } from "@/components/ui";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
export function PaymentModal({ isOpen, onClose, bookingId, amount, onSuccess, }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState("idle");
    const [message, setMessage] = useState("");
    const [countdown, setCountdown] = useState(120);
    const [phoneNumber, setPhoneNumber] = useState("");
    useEffect(() => {
        const loadPhoneNumber = async () => {
            try {
                console.log('Loading phone number for booking:', bookingId);
                const response = await api.get(`/bookings/${bookingId}`);
                console.log('Booking response:', response.status, response.statusText);
                if (response.ok) {
                    const data = await response.json();
                    console.log('Booking data:', data);
                    if (data.booking?.client?.phone) {
                        console.log('Setting phone from client.phone:', data.booking.client.phone);
                        setPhoneNumber(data.booking.client.phone);
                    }
                    else if (data.booking?.clientPhone) {
                        console.log('Setting phone from clientPhone:', data.booking.clientPhone);
                        setPhoneNumber(data.booking.clientPhone);
                    }
                    else {
                        console.log('No phone number found in booking data');
                    }
                }
                else {
                    console.log('Failed to load booking data');
                }
            }
            catch (error) {
                console.error("Error loading phone:", error);
            }
        };
        if (isOpen && bookingId) {
            loadPhoneNumber();
        }
    }, [isOpen, bookingId]);
    if (!isOpen)
        return null;
    const handlePayment = async () => {
        if (!phoneNumber || phoneNumber.trim().length === 0) {
            toast.error("Please enter your M-Pesa phone number");
            return;
        }
        console.log('Initiating payment with:', { bookingId, phoneNumber });
        setIsProcessing(true);
        setStatus("initiating");
        setMessage("Starting payment...");
        try {
            const response = await api.post("/payments/initiate", {
                bookingId,
                phoneNumber,
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Payment failed");
            }
            setStatus("waiting");
            setMessage("Check your phone for M-Pesa prompt...");
            toast.success("Payment request sent! Check your phone for M-Pesa prompt");
            let remaining = 120;
            setCountdown(remaining);
            const interval = setInterval(async () => {
                try {
                    remaining -= 3;
                    setCountdown(Math.max(remaining, 0));
                    const statusRes = await api.get(`/payments/status/${bookingId}`);
                    const statusData = await statusRes.json();
                    if (!statusRes.ok) {
                        throw new Error(statusData.message || "Failed to check status");
                    }
                    if (statusData.paid || statusData.paymentStatus === "paid") {
                        clearInterval(interval);
                        setStatus("success");
                        setMessage("Payment successful!");
                        toast.success("Payment successful");
                        setTimeout(() => {
                            onSuccess();
                            onClose();
                        }, 1500);
                    }
                    else if (remaining <= 0) {
                        clearInterval(interval);
                        setStatus("failed");
                        setMessage("Payment timeout. You can try again.");
                        toast.error("Payment timed out. Try again.");
                        setIsProcessing(false);
                    }
                }
                catch (err) {
                    clearInterval(interval);
                    setStatus("failed");
                    setMessage(err instanceof Error ? err.message : "Payment status check failed");
                    toast.error(err instanceof Error ? err.message : "Payment status check failed");
                    setIsProcessing(false);
                }
            }, 3000);
        }
        catch (error) {
            console.error("Payment error:", error);
            toast.error(error instanceof Error ? error.message : "Payment failed");
            setIsProcessing(false);
        }
    };
    const formatCurrency = (value) => {
        return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
            maximumFractionDigits: 0,
        }).format(value);
    };
    const retryPayment = async () => {
        if (!phoneNumber || phoneNumber.trim().length === 0) {
            toast.error("Please enter your M-Pesa phone number");
            return;
        }
        try {
            setIsProcessing(true);
            setStatus("initiating");
            setMessage("Retrying payment...");
            const response = await api.post(`/payments/retry/${bookingId}`, {
                phoneNumber,
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Retry failed");
            }
            setStatus("waiting");
            setMessage("Check your phone for M-Pesa prompt...");
            toast.success("Retry sent. Check your phone for M-Pesa prompt");
            let remaining = 120;
            setCountdown(remaining);
            const interval = setInterval(async () => {
                try {
                    remaining -= 3;
                    setCountdown(Math.max(remaining, 0));
                    const statusRes = await api.get(`/payments/status/${bookingId}`);
                    const statusData = await statusRes.json();
                    if (!statusRes.ok) {
                        throw new Error(statusData.message || "Failed to check status");
                    }
                    if (statusData.paid || statusData.paymentStatus === "paid") {
                        clearInterval(interval);
                        setStatus("success");
                        setMessage("Payment successful!");
                        toast.success("Payment successful");
                        setTimeout(() => {
                            onSuccess();
                            onClose();
                        }, 1500);
                    }
                    else if (remaining <= 0) {
                        clearInterval(interval);
                        setStatus("failed");
                        setMessage("Payment timeout. You can try again.");
                        toast.error("Payment timed out. Try again.");
                        setIsProcessing(false);
                    }
                }
                catch (err2) {
                    clearInterval(interval);
                    setStatus("failed");
                    setMessage(err2 instanceof Error ? err2.message : "Payment status check failed");
                    toast.error(err2 instanceof Error ? err2.message : "Payment status check failed");
                    setIsProcessing(false);
                }
            }, 3000);
        }
        catch (err) {
            setIsProcessing(false);
            setStatus("failed");
            toast.error(err instanceof Error ? err.message : "Retry failed");
        }
    };
    return (_jsx("div", { className: "fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fadeIn", children: _jsxs(Card, { className: "w-full bg-white rounded-2xl shadow-2xl p-6 animate-up", children: [_jsxs("div", { className: "text-center mb-6", children: [_jsx("div", { className: "w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3", children: _jsx("svg", { className: "w-8 h-8 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" }) }) }), _jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-1", children: "Complete Payment" }), _jsx("p", { className: "text-sm text-gray-600", children: "Pay via M-Pesa" })] }), _jsxs("div", { className: "bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mb-6", children: [_jsx("p", { className: "text-sm text-gray-600 text-center mb-1", children: "Amount to Pay" }), _jsx("p", { className: "text-3xl font-bold text-green-600 text-center", children: formatCurrency(amount) })] }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { htmlFor: "phoneNumber", className: "block text-sm font-medium text-gray-700 mb-2", children: "Registered M-Pesa Number" }), _jsx("input", { type: "tel", id: "phoneNumber", value: phoneNumber, onChange: (e) => setPhoneNumber(e.target.value), placeholder: "0712345678", className: "w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "You'll receive an M-Pesa prompt on your registered number" }), status === "waiting" && (_jsxs("p", { className: "text-xs text-blue-600 mt-1", children: ["Waiting for confirmation... ", countdown, "s"] }))] }), _jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6", children: _jsxs("div", { className: "flex items-start gap-2", children: [_jsx("svg", { className: "w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z", clipRule: "evenodd" }) }), _jsxs("div", { className: "text-sm text-blue-800", children: [_jsx("p", { className: "font-semibold mb-1", children: "Payment Instructions:" }), _jsxs("ul", { className: "list-disc list-inside space-y-1", children: [_jsx("li", { children: "Check your phone for M-Pesa prompt" }), _jsx("li", { children: "Enter your M-Pesa PIN" }), _jsx("li", { children: "Confirm the payment" })] }), message && (_jsx("p", { className: "text-xs text-blue-700 mt-2", children: message }))] })] }) }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { variant: "outline", onClick: onClose, disabled: isProcessing, className: "flex-1", children: "Cancel" }), _jsx(Button, { variant: "primary", onClick: handlePayment, disabled: isProcessing, className: "flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700", children: status === "waiting" || status === "initiating" ? (_jsxs("div", { className: "flex items-center justify-center gap-2", children: [_jsx("div", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" }), _jsx("span", { children: "Processing..." })] })) : ("Pay Now") }), status === "failed" && (_jsx(Button, { variant: "outline", onClick: retryPayment, className: "flex-1", disabled: isProcessing, children: "Retry" }))] }), _jsx("p", { className: "text-xs text-center text-gray-500 mt-4", children: "\uD83D\uDD12 Secure payment powered by IntaSend" })] }) }));
}
