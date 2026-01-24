import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card } from './ui';
export default function ServiceShowcase({ serviceCategory = 'car-detailing' }) {
    const tabs = [
        { id: 'upholstery', label: 'Upholstery' },
        { id: 'move', label: 'Move‑In/Out' },
        { id: 'post', label: 'Post‑Construction' },
        { id: 'deep', label: 'Deep Cleaning' },
    ];
    const media = {
        upholstery: [
            { id: 1, type: 'image', src: '/assets/cleaning/pexels-tima-miroshnichenko-6195895.jpg', title: 'Sofa Shampoo' },
            { id: 2, type: 'image', src: '/assets/cleaning/pexels-tima-miroshnichenko-6195952.jpg', title: 'Detail Vacuum' },
            { id: 3, type: 'image', src: '/assets/cleaning/pexels-tima-miroshnichenko-6200808.jpg', title: 'Fabric Care' },
        ],
        move: [
            { id: 11, type: 'image', src: '/assets/cleaning/pexels-matilda-wormwood-4098579.jpg', title: 'Move‑Out Prep' },
            { id: 12, type: 'video', src: '/assets/cleaning/6195933-mobile-720p.mp4', title: 'Hallway Sweep', poster: '/assets/cleaning/ashwini-chaudhary-monty-Iu6parQAO-U-unsplash.jpg' },
            { id: 13, type: 'video', src: '/assets/cleaning/uhd_25fps-mobile-720p.mp4', title: 'Floor Glide', poster: '/assets/cleaning/pexels-tima-miroshnichenko-6196688.jpg' },
        ],
        post: [
            { id: 21, type: 'image', src: '/assets/cleaning/ashwini-chaudhary-monty-Iu6parQAO-U-unsplash.jpg', title: 'After Build' },
            { id: 22, type: 'video', src: '/assets/cleaning/6197568-mobile-720p.mp4', title: 'Dust Removal', poster: '/assets/cleaning/pexels-tima-miroshnichenko-6200780.jpg' },
            { id: 23, type: 'video', src: '/assets/cleaning/6195933-mobile-720p.mp4', title: 'Surface Polish', poster: '/assets/cleaning/pexels-tima-miroshnichenko-6197122.jpg' },
        ],
        deep: [
            { id: 31, type: 'video', src: '/assets/cleaning/6197568-mobile-720p.mp4', title: 'Machine Scrub', poster: '/assets/cleaning/pexels-tima-miroshnichenko-6195956.jpg' },
            { id: 32, type: 'image', src: '/assets/cleaning/pexels-tima-miroshnichenko-6196688.jpg', title: 'Edge Clean' },
            { id: 33, type: 'image', src: '/assets/cleaning/pexels-tima-miroshnichenko-6200780.jpg', title: 'Shine Finish' },
        ],
    };
    const [active, setActive] = useState(tabs[0].id);
    const [openIndex, setOpenIndex] = useState(null);
    const [slider, setSlider] = useState(50);
    const featuredVideo = '/assets/cleaning/6197568-mobile-720p.mp4';
    const featuredPoster = '/assets/cleaning/pexels-tima-miroshnichenko-6195956.jpg';
    const [failed, setFailed] = useState({});
    const items = media[active];
    const handleVideoClick = (e) => {
        const video = e.currentTarget;
        if (video.paused) {
            video.play();
        }
        else {
            video.pause();
        }
    };
    const handleModalVideoClick = (e) => {
        const video = e.currentTarget;
        if (video.paused) {
            video.play();
        }
        else {
            video.pause();
        }
    };
    const goNext = () => {
        setOpenIndex((prev) => {
            if (prev === null)
                return null;
            return (prev + 1) % items.length;
        });
    };
    const goPrev = () => {
        setOpenIndex((prev) => {
            if (prev === null)
                return null;
            return (prev - 1 + items.length) % items.length;
        });
    };
    useEffect(() => {
        if (openIndex === null)
            return;
        const onKey = (e) => {
            if (e.key === 'Escape')
                setOpenIndex(null);
            if (e.key === 'ArrowRight')
                goNext();
            if (e.key === 'ArrowLeft')
                goPrev();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [openIndex, items.length]);
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex gap-2 overflow-x-auto pb-1", children: tabs.map((t) => (_jsx("button", { onClick: () => setActive(t.id), className: `px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${active === t.id
                        ? 'bg-yellow-100 text-yellow-900 border-yellow-300 shadow-sm'
                        : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'}`, children: t.label }, t.id))) }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3", children: items.map((m, idx) => (_jsxs(Card, { variant: "outlined", hoverable: true, className: "relative p-0 overflow-hidden cursor-pointer group", onClick: () => setOpenIndex(idx), children: [m.type === 'image' ? (_jsx("img", { src: m.src, alt: m.title, className: "w-full h-36 sm:h-40 object-cover", loading: "lazy" })) : failed[m.id] ? (_jsx("img", { src: m.poster || '/assets/cleaning/pexels-tima-miroshnichenko-6195956.jpg', alt: m.title, className: "w-full h-36 sm:h-40 object-cover", loading: "lazy" })) : (_jsx("video", { className: "w-full h-36 sm:h-40 object-cover", src: m.src, poster: m.poster, muted: true, loop: true, playsInline: true, preload: "none", controls: false, onClick: handleVideoClick, onError: () => setFailed((f) => ({ ...f, [m.id]: true })) })), _jsx("div", { className: "absolute inset-x-0 bottom-0 p-2 text-white text-xs bg-gradient-to-t from-black/60 via-black/20 to-transparent", children: _jsx("span", { className: "font-semibold", children: m.title }) })] }, m.id))) }), openIndex !== null && (_jsx("div", { className: "fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center", onClick: () => setOpenIndex(null), children: _jsxs("div", { className: "w-full rounded-2xl overflow-hidden border border-gray-700 shadow-2xl relative", onClick: (e) => e.stopPropagation(), children: [items[openIndex].type === 'image' ? (_jsx("img", { src: items[openIndex].src, alt: items[openIndex].title, className: "w-full h-full object-contain bg-black" })) : failed[items[openIndex].id] ? (_jsx("img", { src: items[openIndex].poster || '/assets/cleaning/pexels-tima-miroshnichenko-6195956.jpg', alt: items[openIndex].title, className: "w-full h-full object-contain bg-black" })) : (_jsx("video", { className: "w-full h-full bg-black", src: items[openIndex].src, poster: items[openIndex].poster, controls: true, muted: true, loop: true, playsInline: true, preload: "none", onClick: handleModalVideoClick, onError: () => setFailed((f) => ({ ...f, [items[openIndex].id]: true })) })), _jsxs("div", { className: "absolute inset-y-0 left-2 right-2 flex items-center justify-between pointer-events-none", children: [_jsx("button", { className: "pointer-events-auto px-3 py-2 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20", onClick: goPrev, children: "Prev" }), _jsx("button", { className: "pointer-events-auto px-3 py-2 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20", onClick: goNext, children: "Next" })] }), _jsxs("div", { className: "p-3 bg-black text-white text-sm flex items-center justify-between", children: [_jsx("span", { className: "font-semibold", children: items[openIndex].title }), _jsx("button", { className: "px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20", onClick: () => setOpenIndex(null), children: "Close" })] })] }) }))] }));
}
