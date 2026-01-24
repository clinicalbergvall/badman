import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { authAPI } from "@/lib/api";
import { saveUserSession } from "@/lib/storage";
import toast from "react-hot-toast";
import { Card } from "./Card";
import { Button } from "./Button";
export const AdminLoginForm = ({ onAuthSuccess, }) => {
    const [formData, setFormData] = useState({
        phone: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await authAPI.login(formData.phone, formData.password);
            if (data.success && data.user) {
                if (data.user.role !== "admin") {
                    toast.error("Access denied. Admin privileges required.");
                    return;
                }
                saveUserSession({
                    userType: data.user.role,
                    name: data.user.name,
                    phone: data.user.phone,
                    lastSignedIn: new Date().toISOString(),
                });
                toast.success("Admin login successful!");
                onAuthSuccess(data.user);
            }
            else {
                toast.error(data.message || "Admin authentication failed");
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
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-slate-950 py-12 px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "w-full space-y-8", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-yellow-400/20", children: _jsx("span", { className: "text-yellow-400 text-2xl", children: "\uD83D\uDD10" }) }), _jsx("h2", { className: "mt-6 text-center text-3xl font-extrabold text-yellow-400", children: "Admin Login" }), _jsx("p", { className: "mt-2 text-sm text-slate-300", children: "Sign in to access the admin dashboard" })] }), _jsx(Card, { className: "bg-slate-900 border border-yellow-400/40 p-8", children: _jsxs("form", { className: "space-y-6", onSubmit: handleSubmit, children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "admin-phone", className: "block text-sm font-medium text-yellow-400 mb-2", children: "Admin Phone Number" }), _jsx("input", { id: "admin-phone", name: "phone", type: "tel", pattern: "0[17]\\d{8}", placeholder: "07XXXXXXXX or 01XXXXXXXX", required: true, value: formData.phone, onChange: handleInputChange, className: "w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "admin-password", className: "block text-sm font-medium text-yellow-400 mb-2", children: "Admin Password" }), _jsx("input", { id: "admin-password", name: "password", type: "password", autoComplete: "current-password", required: true, minLength: 6, value: formData.password, onChange: handleInputChange, className: "w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent", placeholder: "Enter your admin password" })] }), _jsx("div", { children: _jsx(Button, { type: "submit", disabled: loading, loading: loading, className: "w-full bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold py-3 px-4 rounded-lg", children: loading ? "Authenticating..." : "Sign In as Admin" }) }), _jsx("div", { className: "text-center", children: _jsx("a", { href: "/admin/register", className: "text-yellow-400 hover:text-yellow-300 text-sm", children: "Need an admin account? Register here" }) })] }) }), _jsx("div", { className: "text-center", children: _jsx("a", { href: "/", className: "text-slate-400 hover:text-slate-300 text-sm", children: "\u2190 Back to Main Site" }) })] }) }));
};
