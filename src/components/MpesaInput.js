import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId } from 'react';
const mpesaRegex = /^[A-Z0-9]{10}$/;
export default function MpesaInput({ value, onChange, error }) {
    const id = useId();
    return (_jsxs("div", { children: [_jsx("label", { htmlFor: id, className: "label", children: "M-PESA Code" }), _jsx("input", { id: id, className: "input uppercase tracking-wider", inputMode: "text", name: "mpesa", placeholder: "e.g. QJT5L0ABCD", maxLength: 10, pattern: mpesaRegex.source, value: value, onChange: (e) => onChange(e.target.value.toUpperCase().replace(/\s+/g, '')) }), _jsx("p", { className: "helper", children: "10 characters, letters & numbers" }), error ? _jsx("p", { className: "error", children: error }) : null] }));
}
