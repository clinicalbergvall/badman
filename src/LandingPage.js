import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button, Card } from '@/components/ui';
import { LoginForm } from '@/components/ui';
import { loadUserSession } from '@/lib/storage';
export default function LandingPage() {
    const [showLogin, setShowLogin] = useState(false);
    const session = loadUserSession();
    if (session) {
        if (session.userType === 'admin') {
            window.location.href = '/admin';
            return null;
        }
        // Redirect logged in cleaners to the jobs board
        window.location.href = '/jobs';
        return null;
    }
    if (showLogin) {
        return _jsx(LoginForm, { onAuthSuccess: () => window.location.reload() });
    }
    return (_jsx("div", { className: "min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4", style: { backgroundImage: 'url(/assets/images/CLOAKED.jpeg)' }, children: _jsx("div", { className: "max-w-xl w-full", children: _jsxs(Card, { className: "p-8 text-center hover:shadow-xl transition-shadow cursor-pointer border-2 border-yellow-400 bg-yellow-50 hover:border-yellow-500 shadow-sm", onClick: () => {
                    setShowLogin(true);
                }, children: [_jsx("div", { className: "w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-full flex items-center justify-center mx-auto mb-4 text-white overflow-hidden shadow-lg", children: _jsx("img", { src: "/detail-logo.jpg", className: "w-full h-full object-cover", alt: "Detail Logo" }) }), _jsx("h1", { className: "text-4xl md:text-6xl font-bold mb-6 text-black drop-shadow-md", children: "Join the Clean Cloak Family" }), _jsx("p", { className: "text-gray-600 mb-6", children: "Offer Premium Detailing Services and grow your business. Find cleaning jobs near you and get paid securely." }), _jsxs("div", { className: "space-y-2 text-sm text-gray-500", children: [_jsxs("div", { className: "flex items-center justify-center gap-2", children: [_jsx("span", { children: "\u2713" }), _jsx("span", { children: "Find cleaning jobs near you" })] }), _jsxs("div", { className: "flex items-center justify-center gap-2", children: [_jsx("span", { children: "\u2713" }), _jsx("span", { children: "Flexible work schedule" })] }), _jsxs("div", { className: "flex items-center justify-center gap-2", children: [_jsx("span", { children: "\u2713" }), _jsx("span", { children: "Build your professional profile" })] }), _jsxs("div", { className: "flex items-center justify-center gap-2", children: [_jsx("span", { children: "\u2713" }), _jsx("span", { children: "Get paid securely" })] })] }), _jsx(Button, { className: "w-full mt-6", variant: "primary", children: "Join as Cleaner" })] }) }) }));
}
