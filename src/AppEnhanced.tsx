import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import BookingEnhanced from "./pages/BookingEnhanced";
import BookingHistory from "./pages/BookingHistory";
import CleanerProfile from "./pages/CleanerProfile";
import { LoginForm } from "./components/ui";
import { loadUserSession, clearUserSession } from "./lib/storage";
import ErrorBoundary from "./components/ErrorBoundary";
import { authAPI } from "@/lib/api";
import { NotificationCenter } from "./components/NotificationCenter";
import { API_BASE_URL } from "./lib/config";

type Page = "booking" | "history" | "profile";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab") as Page | null;
    return tab && ["booking", "history", "profile"].includes(tab) ? tab : "booking";
  });
  const [darkMode, setDarkMode] = useState(false);
  const [performanceMode, setPerformanceMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode) {
      setDarkMode(savedMode === "true");
    }
  }, []);

  useEffect(() => {
    const savedPerf = localStorage.getItem("performanceMode");
    if (savedPerf) {
      setPerformanceMode(savedPerf === "true");
    } else {
      const prefersReduced = typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;
      const isAndroid = Capacitor.getPlatform() === "android";
      const isNative = typeof Capacitor.isNativePlatform === "function"
        ? Capacitor.isNativePlatform()
        : isAndroid;
      if (prefersReduced || (isNative && isAndroid)) {
        setPerformanceMode(true);
        localStorage.setItem("performanceMode", "true");
      }
    }
  }, []);

  useEffect(() => {
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", String(newMode));
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab") as Page | null;
    if (tab && tab !== currentPage && ["booking", "history", "profile"].includes(tab)) {
      setCurrentPage(tab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const setTab = (page: Page) => {
    if (page === currentPage) return;
    setCurrentPage(page);
    const params = new URLSearchParams(location.search);
    params.set("tab", page);
    navigate({ pathname: "/", search: params.toString() });
  };

  const togglePerformanceMode = () => {
    const newVal = !performanceMode;
    setPerformanceMode(newVal);
    localStorage.setItem("performanceMode", String(newVal));
  };

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), performanceMode ? 800 : 2500);
    return () => clearTimeout(t);
  }, [performanceMode]);

  return (
    <ErrorBoundary>
      {showSplash && (
        <div
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-white via-white to-yellow-50 ${performanceMode ? "" : "animate-fade"}`}
        >
          <img
            src="/app-icon.png"
            alt="Clean Cloak App Icon"
            className={`h-28 w-28 mb-6 ${performanceMode ? "" : "animate-pulse"}`}
          />
          <h1 className={`text-display text-3xl md:text-4xl font-black tracking-tight text-gray-900`}>Clean Cloak</h1>
        </div>
      )}
      <div className={`min-h-screen relative overflow-y-auto overflow-x-hidden ${performanceMode ? "reduced-motion" : ""}`}>
        {/* Animated Gradient Background */}
        <div
          className="fixed inset-0 z-0 transition-all duration-1000"
          style={{
            background: darkMode
              ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
              : "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
            backgroundSize: "200% 200%",
            animation: performanceMode ? undefined : "gradient-shift 15s ease infinite",
          }}
        >
          {/* Glassmorphism Overlay */}
          <div
            className={`absolute inset-0 ${darkMode ? "bg-black/40" : "bg-white/30"} backdrop-blur-3xl`}
          ></div>

          {!performanceMode && (
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
              <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
              <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="relative z-10 container max-w-5xl mx-auto px-4 py-8 animate-fade">
          {/* Premium Welcome Banner with Glassmorphism */}
          <div
            className={
              performanceMode
                ? `relative text-center mb-8 py-6 px-6 rounded-3xl border ${
                    darkMode
                      ? "bg-gray-800/40 border-gray-600/50"
                      : "bg-white/60 border-white/40"
                  }`
                : `relative text-center mb-8 py-6 px-6 rounded-3xl backdrop-blur-xl border transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${
                    darkMode
                      ? "bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 border-yellow-400/30 shadow-[0_0_40px_rgba(250,204,21,0.3)]"
                      : "bg-gradient-to-r from-yellow-400/30 to-yellow-500/30 border-yellow-300/50 shadow-[0_8px_32px_rgba(250,204,21,0.4)]"
                  }`
            }
          >
            {!performanceMode && (
              <div className="hero-3d">
                <div className="neon-ring" />
                <div className="neon-ring alt" />
                <div className="sparkles-l" />
                <div className="sparkles-s" />
              </div>
            )}
            <h1
              className={`heading-3d text-4xl md:text-5xl font-black tracking-tight mb-3 ${
                darkMode ? "text-white" : "text-white drop-shadow-lg"
              }`}
            >
              Welcome to Clean Cloak
            </h1>
            <p
              className={`tagline-3d text-base md:text-lg font-semibold ${
                darkMode ? "text-yellow-100" : "text-white drop-shadow-md"
              }`}
            >
              Elevating spaces and Empowering cleaners through tech
            </p>
          </div>

          {/* Header with Glass Effect */}
          <header className="mb-8 animate-up">
            <div
              className={`flex items-center justify-between mb-6 pb-4 border-b backdrop-blur-sm ${
                darkMode ? "border-gray-600/50" : "border-white/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="Clean Cloak Logo"
                  className={
                performanceMode
                      ? "h-60 w-auto object-contain"
                      : "h-60 w-auto object-contain transition-transform duration-500 hover:scale-110 hover:rotate-3 logo-animate"
                }
                />
              </div>
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <NotificationCenter />

            <div
              className={`text-sm px-3 py-1 rounded ${
                isOnline ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
              }`}
            >
              {isOnline ? "Online" : "Offline"}
            </div>

              

                {/* Premium Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 hover:rotate-12 ${
                    darkMode
                      ? "bg-gray-800/50 text-yellow-400 hover:bg-gray-700/70 shadow-[0_0_20px_rgba(250,204,21,0.3)]"
                      : "bg-white/40 text-gray-700 hover:bg-white/60 shadow-lg backdrop-blur-md"
                  }`}
                  title={
                    darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
                  }
                >
                  {darkMode ? (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  )}
                </button>

                <button
                  onClick={togglePerformanceMode}
                  className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                    performanceMode
                      ? "bg-green-600/60 text-white hover:bg-green-600 shadow-lg"
                      : darkMode
                        ? "bg-gray-800/50 text-gray-200 hover:bg-gray-700/70"
                        : "bg-white/40 text-gray-700 hover:bg-white/60 shadow-lg backdrop-blur-md"
                  }`}
                  title={performanceMode ? "Disable Performance Mode" : "Enable Performance Mode"}
                >
                  {performanceMode ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 3a1 1 0 011 1v2a1 1 0 11-2 0V4a1 1 0 011-1zm4.243 1.757a1 1 0 011.414 1.414l-1.414 1.414a1 1 0 11-1.414-1.414l1.414-1.414zM17 9a1 1 0 110 2h-2a1 1 0 110-2h2zM14.657 14.657a1 1 0 10-1.414 1.414l1.414 1.414a1 1 0 001.414-1.414l-1.414-1.414zM10 15a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zM4.929 4.929a1 1 0 10-1.414 1.414L4.929 7.757a1 1 0 101.414-1.414L4.929 4.929zM3 9a1 1 0 100 2h2a1 1 0 100-2H3zM5.343 14.657a1 1 0 011.414 0l1.414 1.414a1 1 0 11-1.414 1.414L5.343 16.071a1 1 0 010-1.414z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 11h12l-1.5 4H5.5L4 11zm1.5-6h9l1.5 4H4L5.5 5z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Premium Navigation Tabs with Glassmorphism */}
            <nav
              className={
                performanceMode
                  ? `flex gap-1 p-1.5 rounded-2xl border w-full ${
                      darkMode
                        ? "bg-gray-900/20 border-gray-700/40"
                        : "bg-white/50 border-white/40"
                    }`
                  : `flex gap-1 p-1.5 rounded-2xl backdrop-blur-xl border w-full ${
                      darkMode
                        ? "bg-gray-900/40 border-gray-700/50"
                        : "bg-white/30 border-white/40 shadow-xl"
                    }`
              }
            >
              <button
                onClick={() => setTab("booking")}
                className={`flex-1 px-4 py-2 sm:px-5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                  currentPage === "booking"
                    ? darkMode
                      ? "bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900 shadow-[0_0_30px_rgba(250,204,21,0.5)] sm:scale-105"
                      : "bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 shadow-[0_8px_20px_rgba(250,204,21,0.4)] sm:scale-105"
                    : darkMode
                      ? "text-gray-300 hover:text-white hover:bg-gray-800/50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/40"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5 hidden sm:block"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  New Booking
                </div>
              </button>
              <button
                onClick={() => setTab("history")}
                className={`flex-1 px-4 py-2 sm:px-5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                  currentPage === "history"
                    ? darkMode
                      ? "bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900 shadow-[0_0_30px_rgba(250,204,21,0.5)] sm:scale-105"
                      : "bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 shadow-[0_8px_20px_rgba(250,204,21,0.4)] sm:scale-105"
                    : darkMode
                      ? "text-gray-300 hover:text-white hover:bg-gray-800/50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/40"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5 hidden sm:block"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  My Bookings
                </div>
              </button>
              <button
                onClick={() => setTab("profile")}
                className={`flex-1 px-4 py-2 sm:px-5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                  currentPage === "profile"
                    ? darkMode
                      ? "bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900 shadow-[0_0_30px_rgba(250,204,21,0.5)] sm:scale-105"
                      : "bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 shadow-[0_8px_20px_rgba(250,204,21,0.4)] sm:scale-105"
                    : darkMode
                      ? "text-gray-300 hover:text-white hover:bg-gray-800/50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/40"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5 hidden sm:block"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Profile
                </div>
              </button>
            </nav>
          </header>

          {/* Premium Main Content with Glassmorphism */}
          <main
            className={
              performanceMode
                ? `rounded-3xl border p-8 overflow-x-auto max-w-full ${
                    darkMode
                      ? "bg-gray-900/30 border-gray-700/40"
                      : "bg-white/70 border-white/40"
                  }`
                : `rounded-3xl border p-8 overflow-x-auto max-w-full backdrop-blur-xl transition-all duration-500 hover:shadow-2xl ${
                    darkMode
                      ? "bg-gray-900/40 border-gray-700/50 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
                      : "bg-white/40 border-white/50 shadow-[0_8px_32px_rgba(255,255,255,0.3)]"
                  }`
            }
          >
            {currentPage === "booking" && <BookingEnhanced />}
            {currentPage === "history" && <BookingHistory />}
            {currentPage === "profile" && (
              <div className="flex gap-4 max-w-2xl mx-auto">
                <button
                  onClick={() => (window.location.href = "/profile")}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  My Profile
                </button>
                <button
                  onClick={() => (window.location.href = "/completed-bookings")}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  Payments
                </button>
              </div>
            )}
          </main>

          {/* Premium Footer */}
          <footer
            className={`mt-8 text-center text-sm font-medium transition-all duration-300 ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            <p className="backdrop-blur-sm bg-white/10 rounded-full px-6 py-2 inline-block">
              Elevating spaces and Empowering cleaners through tech
            </p>
          </footer>
        </div>
      </div>
    </ErrorBoundary>
  );
}
