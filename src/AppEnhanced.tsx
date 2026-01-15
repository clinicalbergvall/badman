
/// <reference types="./types/global" />
import React from "react";
const { useState, useEffect } = React;
import { useLocation, useNavigate } from "react-router-dom";
import BookingEnhanced from "./pages/BookingEnhanced";
import BookingHistory from "./pages/BookingHistory";
import CleanerProfile from "./pages/CleanerProfile";
import { LoginForm } from "./components/ui";
import { loadUserSession, clearUserSession } from "./lib/storage";
import ErrorBoundary from "./components/ErrorBoundary";
import { authAPI } from "@/lib/api";
import { NotificationCenter } from "./components/NotificationCenter";
import { API_BASE_URL } from "./lib/config";



const getCapacitor = async () => {
  try {
    const capacitorModule = await import("@capacitor/core");
    return capacitorModule.Capacitor;
  } catch (err) {
    console.warn("Capacitor not available in this environment:", err);

    return {
      isNativePlatform: () => false,
    };
  }
};

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode) {
      setDarkMode(savedMode === "true");
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

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        const viewportHeight = window.innerHeight;
        const documentHeight = document.documentElement.clientHeight;
        const heightDifference = Math.abs(documentHeight - viewportHeight);
        
        setIsKeyboardVisible(heightDifference > 150);
      }
    };
    
    // Listen for both resize and orientationchange events
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
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

  }, [location.search]);

  const setTab = (page: Page) => {
    if (page === currentPage) return;
    setCurrentPage(page);
    const params = new URLSearchParams(location.search);
    params.set("tab", page);
    navigate(`/?${params.toString()}`);
  };


  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(location.search);
      const tab = params.get("tab") as Page | null;
      if (tab && ["booking", "history", "profile"].includes(tab)) {
        setCurrentPage(tab);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [location.search]);


  useEffect(() => {
    const handleHardwareBackButton = () => {
      const params = new URLSearchParams(location.search);
      const tab = params.get("tab") as Page | null;


      if (tab && ["history", "profile"].includes(tab)) {
        setTab("booking");
      } else {


        if (window.history.length === 1) {

          getCapacitor().then(Capacitor => {
            if (Capacitor.isNativePlatform()) {

              import("@capacitor/app").then(module => {
                module.App.exitApp();
              });
            }
          });
        } else {
          window.history.back();
        }
      }
    };


    getCapacitor().then(capacitorInstance => {
      if (capacitorInstance.isNativePlatform()) {
        import("@capacitor/app").then(module => {
          module.App.addListener('backButton', handleHardwareBackButton);
        });
      }
    });


    return () => {
      getCapacitor().then(capacitorInstance => {
        if (capacitorInstance.isNativePlatform()) {
          import("@capacitor/app").then(module => {
            module.App.removeAllListeners();
          });
        }
      });
    };
  }, [location.search]);





  const isValidTabRoute = location.pathname === "/" &&
    (location.search === "" ||
      location.search.startsWith("?tab=booking") ||
      location.search.startsWith("?tab=history") ||
      location.search.startsWith("?tab=profile"));


  const excludedPaths = ["/profile", "/completed-bookings", "/active-booking", "/admin", "/jobs", "/cleaner-active", "/cleaner-profile", "/earnings"];
  const isExcludedPath = excludedPaths.some(path => location.pathname.startsWith(path));


  const isSubRoute = location.pathname !== "/";


  useEffect(() => {
    if (location.pathname !== "/") {


      console.warn("AppEnhanced accessed on non-root path, redirecting to /");
    }
  }, [location.pathname]);


  useEffect(() => {
    const registerPushNotifications = async () => {
      try {
        const capacitorInstance = await getCapacitor();
        if (capacitorInstance.isNativePlatform()) {
          console.log('Initializing push notifications for native platform');
          try {

            const pushNotificationModule = await import('./lib/pushNotifications');
            if (pushNotificationModule && pushNotificationModule.PushNotificationService) {
              await pushNotificationModule.PushNotificationService.registerForNotifications();
              console.log('Push notifications registered successfully');
            } else {
              console.warn('PushNotificationService not available');
            }
          } catch (importError) {
            console.error('Error importing push notifications:', importError);
          }
        } else {
          console.log('Running in web environment, skipping native push notifications');
        }
      } catch (error) {
        console.error('Error in push notification registration process:', error);
      }
    };

    // Delay push notification registration to ensure Capacitor is ready
    const pushTimer = setTimeout(registerPushNotifications, 2000);
    
    return () => {
      clearTimeout(pushTimer);
    };
  }, []);

  return (
    <ErrorBoundary>
      <div className={`min-h-screen relative overflow-y-auto overflow-x-hidden m-0 p-0 max-w-md mx-auto ${isKeyboardVisible ? 'safe-area-inset' : ''}`}>
        { }
        <div
          className="fixed inset-0 z-0"
          style={{
            background: darkMode
              ? "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
              : "linear-gradient(135deg, #bbdefb 0%, #64b5f6 100%)",
            backgroundSize: "400% 400%",
          }}
        >
          { }
          <div
            className={`absolute inset-0 ${darkMode ? "bg-black/30" : "bg-white/20"}`}
          ></div>
        </div>

        { }
        <div className="relative z-10 w-full m-0 p-0 animate-fade">
          { }
          <div
            className={
              `relative text-center my-0 mx-0 py-2 px-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black`
            }
          >
            <p
              className={`text-base md:text-lg font-semibold text-gray-100 uppercase`}
            >
              ELEVATING SPACES AND EMPOWERING CLEANERS THROUGH TECH
            </p>
          </div>

          { }
          <header className="mb-0">
            <div
              className={`flex items-center justify-between mb-0 pb-2 border-b backdrop-blur-sm ${darkMode ? "border-gray-600/50" : "border-white/30"
                }`}
            >

              <div className="flex items-center gap-3">


              </div>
            </div>

            { }
            {isValidTabRoute && !isExcludedPath && !isSubRoute && (
              <div
                className={`mb-0 bg-gradient-to-t from-gray-900 to-gray-950/80 backdrop-blur-sm border-t border-gray-700`}
              >
                <div className="flex justify-between py-2 px-0">
                  <button
                    onClick={() => setTab("booking")}
                    className={`flex flex-col items-center gap-1 flex-1 transition-all duration-300 p-3 rounded-xl ${currentPage === "booking"
                      ? "text-amber-400 bg-gray-800/40 shadow-inner"
                      : "text-gray-300 hover:text-gray-100 hover:bg-gray-800/20"
                      }`}
                  >
                    <svg
                      className="w-6 h-6"
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
                    <span className="text-xs font-medium text-center mt-1">Book</span>
                  </button>
                  <button
                    onClick={() => setTab("history")}
                    className={`flex flex-col items-center gap-1 flex-1 transition-all duration-300 p-3 rounded-xl ${currentPage === "history"
                      ? "text-amber-400 bg-gray-800/40 shadow-inner"
                      : "text-gray-300 hover:text-gray-100 hover:bg-gray-800/20"
                      }`}
                  >
                    <svg
                      className="w-6 h-6"
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
                    <span className="text-xs font-medium text-center mt-1">History</span>
                  </button>
                  <button
                    onClick={() => setTab("profile")}
                    className={`flex flex-col items-center gap-1 flex-1 transition-all duration-300 p-3 rounded-xl ${currentPage === "profile"
                      ? "text-amber-400 bg-gray-800/40 shadow-inner"
                      : "text-gray-300 hover:text-gray-100 hover:bg-gray-800/20"
                      }`}
                  >
                    <svg
                      className="w-6 h-6"
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
                    <span className="text-xs font-medium text-center mt-1">Profile</span>
                  </button>
                </div>
              </div>
            )}

            { }
            <main
              className={
                `w-full min-h-screen max-w-md mx-auto overflow-x-hidden px-0 ${darkMode
                  ? "bg-gray-900"
                  : "bg-white"
                }`
              }
              style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            >
              {(isValidTabRoute && !isExcludedPath && !isSubRoute) ? (
                <>
                  {currentPage === "booking" && <BookingEnhanced />}
                  {currentPage === "history" && <BookingHistory />}
                  {currentPage === "profile" && (
                    <div className="flex gap-0 w-full">
                      <button
                        onClick={() => navigate("/profile")}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 transition-all duration-300 flex items-center justify-center gap-2"
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
                        onClick={() => navigate("/completed-bookings")}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 px-6 transition-all duration-300 flex items-center justify-center gap-2"
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
                </>
              ) : (

                <div className="flex flex-col items-center justify-center py-2">
                  <div className="text-center w-full relative">
                    <h2 className="text-2xl font-bold mb-4 text-gray-100">
                      CleanCloak
                    </h2>
                    <p className="text-gray-400 mb-6">
                      Navigate to the appropriate section using the menu
                    </p>
                  </div>
                </div>
              )}
            </main>
          </header>



        </div>
      </div>
    </ErrorBoundary>
  );
}
