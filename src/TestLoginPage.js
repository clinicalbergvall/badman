import { jsx as _jsx } from "react/jsx-runtime";
import { LoginForm } from './components/ui';
export default function TestLoginPage() {
    return (_jsx("div", { children: _jsx(LoginForm, { onAuthSuccess: (user) => {
                console.log('Login successful:', user);
                window.location.href = '/';
            } }) }));
}
