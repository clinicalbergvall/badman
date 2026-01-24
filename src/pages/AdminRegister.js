import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';
export default function AdminRegister() {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { name, phone, password } = formData;
            const result = await authAPI.register({
                name,
                phone,
                password,
                role: 'admin'
            });
            if (result.success) {
                toast.success('Admin account created successfully!');
                setTimeout(() => {
                    window.location.href = '/admin';
                }, 2000);
            }
        }
        catch (error) {
            const errorMsg = error?.response?.data?.message || error?.message || 'Failed to create admin account';
            toast.error(errorMsg);
            console.error('Admin registration error:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-slate-950 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-slate-900 border border-yellow-400/40 rounded-2xl p-8 w-full shadow-[0_0_35px_rgba(234,179,8,0.25)]", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h1", { className: "text-yellow-400 text-3xl font-bold mb-2", children: "Admin Registration" }), _jsx("p", { className: "text-slate-300", children: "Create administrator account" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "name", className: "block text-sm font-medium text-yellow-400 mb-2", children: "Full Name" }), _jsx("input", { id: "name", name: "name", type: "text", required: true, value: formData.name, onChange: handleInputChange, className: "w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent", placeholder: "Enter your full name" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "phone", className: "block text-sm font-medium text-yellow-400 mb-2", children: "Phone Number" }), _jsx("input", { id: "phone", name: "phone", type: "tel", pattern: "0[17]\\d{8}", required: true, value: formData.phone, onChange: handleInputChange, className: "w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent", placeholder: "07XXXXXXXX or 01XXXXXXXX" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-yellow-400 mb-2", children: "Password" }), _jsx("input", { id: "password", name: "password", type: "password", required: true, value: formData.password, onChange: handleInputChange, className: "w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent", placeholder: "Create a strong password" })] }), _jsx("button", { type: "submit", disabled: isLoading, className: "w-full bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed", children: isLoading ? 'Creating Admin Account...' : 'Create Admin Account' })] }), _jsx("div", { className: "mt-6 text-center", children: _jsx("a", { href: "/admin", className: "text-yellow-400 hover:text-yellow-300 text-sm", children: "\u2190 Back to Admin Login" }) })] }) }));
}
