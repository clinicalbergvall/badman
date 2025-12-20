import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadUserSession } from "@/lib/storage";
import toast from "react-hot-toast";
import ErrorBoundary from "../components/ErrorBoundary";
import { API_BASE_URL } from "@/lib/config";
import { logger } from "@/lib/logger";
import { api } from "@/lib/api";

interface Transaction {
  id: string;
  type: "booking" | "payment";
  amount: number;
  status: "pending" | "completed" | "cancelled";
  date: string;
  description: string;
  serviceType?: string;
  cleanerName?: string;
}

interface ClientProfile {
  name: string;
  phone: string;
  totalTransactions: number;
  totalDeals: number;
  totalSpent: number;
  memberSince: string;
  verificationStatus: "verified" | "pending" | "unverified";
}

export default function ClientProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<{ ok: boolean; base: string } | null>(null);

  useEffect(() => {
    loadProfileData();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    api.get("/health", { signal: controller.signal })
      .then((r) => setApiStatus({ ok: r.ok, base: API_BASE_URL }))
      .catch(() => setApiStatus({ ok: false, base: API_BASE_URL }))
      .finally(() => clearTimeout(timeout));
  }, []);

  const loadProfileData = async () => {
    try {
      const session = loadUserSession();

      if (!session) {
        setLoading(false);
        return;
      }

      // Initial profile from session
      const initialProfile: ClientProfile = {
        name: session.name || "Client",
        phone: session.phone || "",
        totalTransactions: 0,
        totalDeals: 0,
        totalSpent: 0,
        memberSince: session.lastSignedIn
          ? new Date(session.lastSignedIn).toLocaleDateString()
          : new Date().toLocaleDateString(),
        verificationStatus: "verified",
      };

      // Load transaction history
      const response = await api.get("/bookings");

      if (response.ok) {
        const data = await response.json();
        const transactionData: Transaction[] =
          data.bookings?.map((booking: any) => ({
            id: booking._id,
            type: "booking",
            amount: booking.totalPrice || 0,
            status: booking.status,
            date: booking.createdAt,
            description: `Cleaning service - ${booking.serviceType || "Standard"}`,
            serviceType: booking.serviceType,
            cleanerName: booking.cleanerName,
          })) || [];

        setTransactions(transactionData);

        // Calculate totals
        const completedDeals = transactionData.filter(
          (t) => t.status === "completed",
        ).length;
        const totalSpent = transactionData
          .filter((t) => t.status === "completed")
          .reduce((sum, t) => sum + t.amount, 0);

        setProfile({
          ...initialProfile,
          totalTransactions: transactionData.length,
          totalDeals: completedDeals,
          totalSpent,
        });
      } else {
        setProfile(initialProfile);
      }
    } catch (error) {
      logger.error("Profile load error:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-full mx-auto px-4 py-8 overflow-x-auto">
          {apiStatus && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm flex items-center justify-between ${
                apiStatus.ok
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              <span>
                API {apiStatus.ok ? "reachable" : "unreachable"}
              </span>
              {!apiStatus.ok && (
                <a href="/" className="underline">
                  Change API in header
                </a>
              )}
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

          {!profile ? (
            <div className="bg-white rounded-xl shadow-sm p-6 text-center max-w-md mx-auto">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-blue-600"
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
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Login Required
              </h2>
              <p className="text-gray-600 mb-6">
                Please login to view your profile and booking history
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => (window.location.href = "/test-login")}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg"
                >
                  Login / Register
                </button>
                <button
                  onClick={() => (window.location.href = "/")}
                  className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                >
                  Go to Home
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold">{profile.name}</h2>
                  <p className="text-gray-600">{profile.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {profile.totalTransactions}
                  </div>
                  <div className="text-sm text-blue-600">Transactions</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {profile.totalDeals}
                  </div>
                  <div className="text-sm text-green-600">Completed</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    KSH {profile.totalSpent}
                  </div>
                  <div className="text-sm text-purple-600">Total Spent</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Recent Transactions</h3>
                {transactions.length === 0 ? (
                  <p className="text-gray-500">No transactions yet</p>
                ) : (
                  <div className="space-y-2">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="border rounded p-3">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">
                              {transaction.description}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(transaction.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">
                              KSH {transaction.amount}
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                transaction.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : transaction.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {transaction.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
