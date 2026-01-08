import React, { Suspense, useEffect } from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import AppEnhanced from "./AppEnhanced";
import AdminDashboard from "./pages/AdminDashboard";
import CleanerJobs from "./pages/cleanersjob";
import AdminRegister from "./pages/AdminRegister";
import ClientProfile from "./pages/ClientProfile";
import ActiveBooking from "./pages/ActiveBooking";
import CleanerProfile from "./pages/CleanerProfile";
import CleanerActiveBookings from "./pages/CleanerActiveBookings";
import CompletedBookings from "./pages/CompletedBookings";
import Earnings from "./pages/Earnings";
import { LoginForm, AdminLoginForm } from "./components/ui";
import { loadUserSession, getStoredAuthToken } from "./lib/storage";
import { NotificationProvider } from "./contexts/NotificationContext";
import { API_BASE_URL } from "./lib/config";
import { api } from "./lib/api";
import "./index.css";
import { Toaster, toast } from "react-hot-toast";


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


try {
  if (import.meta.env.MODE === "production" && !import.meta.env.VITE_API_URL) {
    console.error("CRITICAL: VITE_API_URL is not set in production!");
  }
} catch (error) {
  console.warn("Environment check failed:", error);
}

console.log("App starting with API:", API_BASE_URL);


window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});


export const showNotification = (
  message: string,
  type: "success" | "error" | "info" = "info",
) => {
  switch (type) {
    case "success":
      toast.success(message);
      break;
    case "error":
      toast.error(message);
      break;
    default:
      toast(message);
  }
};


const ProtectedRoute = ({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: string;
}) => {
  const [checked, setChecked] = React.useState(false);
  const [localSession, setLocalSession] = React.useState(loadUserSession());

  React.useEffect(() => {
    let cancelled = false;

    
    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        setChecked(true);
      }
    }, 5000); 

    if (!localSession) {
      (async () => {
        try {
          const res = await api.get("/auth/me");
          if (res.ok) {
            const data = await res.json();
            const u = (data && (data.user || data)) || {};
            const hydrated = {
              ...u,
              userType: u.userType || u.role,
              name: u.name || "",
              phone: u.phone || "",
              lastSignedIn: new Date().toISOString(),
            };
            localStorage.setItem(
              "cleancloak-user-session",
              JSON.stringify(hydrated),
            );
            if (!cancelled) setLocalSession(hydrated);
          }
        } catch (error) {
          console.error('Error fetching user session:', error);
          
          if (!cancelled) setChecked(true);
        }
        if (!cancelled) {
          clearTimeout(timeoutId);
          setChecked(true);
        }
      })();
    } else {
      clearTimeout(timeoutId);
      setChecked(true);
    }

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [localSession]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-yellow-500"></div>
      </div>
    );
  }

  if (!localSession) {
    if (requiredRole === "admin") {
      return <AdminLoginForm onAuthSuccess={() => window.location.reload()} />;
    }
    return <LoginForm onAuthSuccess={() => window.location.reload()} />;
  }

  if (requiredRole && localSession.userType !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};


class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    
    console.error("Error Boundary caught an error:", error);
    console.error("Error Info:", errorInfo);

    
    if (process.env.NODE_ENV === "production") {
      
      console.error("Production error - check logs for details");
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-yellow-400/40 rounded-2xl p-8 max-w-md w-full text-center shadow-[0_0_35px_rgba(234,179,8,0.25)]">
            <div className="w-16 h-16 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-yellow-400 text-2xl">⚠️</span>
            </div>
            <h1 className="text-yellow-400 text-2xl font-bold mb-4">
              Admin Dashboard
            </h1>
            <p className="text-slate-300 mb-2">Unable to load the dashboard</p>
            <p className="text-slate-400 text-sm mb-6">
              Check your connection or try refreshing
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 px-6 py-3 rounded-xl font-bold transition-all"
            >
              Refresh Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}


const BackButtonHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const backPressWindowMs = 2000;
  const lastBackPressRef = React.useRef(0);

  useEffect(() => {
    let backButtonListener: any = null;

    
    (async () => {
      try {
        const capacitorInstance = await getCapacitor();
        if (capacitorInstance.isNativePlatform()) {
          const appModule = await import("@capacitor/app");
          backButtonListener = await appModule.App.addListener(
            "backButton",
            () => {
              const evt = new CustomEvent("app:hardwareBack", { cancelable: true });
              const proceed = document.dispatchEvent(evt);
              if (!proceed) return;

              const atRoot = location.pathname === "/";
              if (!atRoot) {
                navigate(-1);
                return;
              }

              if (window.history.length > 1) {
                navigate(-1);
                return;
              }

              const now = Date.now();
              if (now - lastBackPressRef.current < backPressWindowMs) {
                appModule.App.exitApp();
              } else {
                lastBackPressRef.current = now;
                toast("Press back again to exit");
              }
            },
          );
        }
      } catch (error) {
        console.warn('Back button handler failed:', error);
      }
    })();

    return () => {
      (async () => {
        if (backButtonListener) {
          try {
            const appModule = await import("@capacitor/app");
            await appModule.App.removeAllListeners();
          } catch (error) {
            console.warn('Failed to remove back button listener:', error);
          }
        }
      })();
    };
  }, [navigate, location]);

  return null;
};

const Root = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <NotificationProvider>
          <BackButtonHandler />
          <Suspense
            fallback={
              <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400"></div>
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<AppEnhanced />} />
              <Route path="/profile" element={<ClientProfile />} />
              <Route
                path="/completed-bookings"
                element={
                  <ProtectedRoute requiredRole="client">
                    <CompletedBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/active-booking/:id"
                element={
                  <ProtectedRoute>
                    <ActiveBooking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/admin/register" element={<AdminRegister />} />
              <Route
                path="/jobs"
                element={
                  <ProtectedRoute requiredRole="cleaner">
                    <CleanerJobs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cleaner-active"
                element={
                  <ProtectedRoute requiredRole="cleaner">
                    <CleanerActiveBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cleaner-profile"
                element={
                  <ProtectedRoute requiredRole="cleaner">
                    <CleanerProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/earnings"
                element={
                  <ProtectedRoute requiredRole="cleaner">
                    <Earnings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/test-login"
                element={
                  <LoginForm
                    onAuthSuccess={() => (window.location.href = "/")}
                  />
                }
              />
            </Routes>
          </Suspense>
        </NotificationProvider>
      </ErrorBoundary>
      <Toaster position="top-right" toastOptions={{
        
        className: 'cleancloak-toast',
        duration: 4000,
        style: {
          background: '#1f2937',
          color: '#f3f4f6',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          maxWidth: '350px',
          zIndex: 9999,
        },
      }} />
    </BrowserRouter>
  );
};




const initializeApp = () => {
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      renderApp();
    });
  } else {
    renderApp();
  }
};

const renderApp = () => {
  try {
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      console.error("Root element not found");
      return;
    }

    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <Root />
      </React.StrictMode>,
    );
  } catch (error) {
    console.error("Failed to initialize app:", error);
    
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 20px; background-color: #f3f4f6;">
          <div>
            <h1 style="color: #FACC15; margin-bottom: 16px; font-family: sans-serif; font-size: 24px;">CleanCloak</h1>
            <p style="color: #6B7280; margin-bottom: 8px; font-family: sans-serif;">App failed to load</p>
            <p style="color: #9CA3AF; font-size: 14px; font-family: sans-serif;">Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
            <p style="color: #9CA3AF; font-size: 12px; font-family: sans-serif; margin-top: 10px;">Check browser console for more details</p>
          </div>
        </div>
      `;
    }
  }
};


initializeApp();
