import { useState, useEffect } from "react";
import Header from "../components/layout/Header";
import OrderManagement from "../components/modules/OrderManagement";
import UserManagement from "../components/modules/UserManagement";
import { isAdmin, setAdmin } from "../utils/storage/auth";
// Using explicit .js extension in the import
import { checkAndRefreshAdminStatus } from "../utils/helpers/adminAuth.js";
// Import admin debugging utilities in development
const AdminDebug = import.meta.env.DEV
  ? import("../utils/helpers/adminDebug")
  : { debugAdminStatus: () => {} };

export default function Admin() {
  const [activeTab, setActiveTab] = useState("users"); // 'users' or 'orders'
  const [adminAccessConfirmed, setAdminAccessConfirmed] = useState(false);

  // Check admin access on mount
  useEffect(() => {
    const checkAdminAccess = async () => {
      // In development, use the debugging utilities
      if (import.meta.env.DEV) {
        const debug = await AdminDebug;
        debug.debugAdminStatus();

        // Auto-enable admin mode if URL contains admin=true or env var is set
        if (
          window.location.search.includes("admin=true") ||
          import.meta.env.VITE_ALWAYS_ADMIN === "true"
        ) {
          setAdminAccessConfirmed(true);
          return;
        }
      } // Use our new utility to check and refresh admin status
      const adminStatus = await checkAndRefreshAdminStatus();
      console.log(
        "Admin status check in Admin page after refresh:",
        adminStatus
      );
      setAdminAccessConfirmed(adminStatus);
    };

    checkAdminAccess();
  }, []);
  // Enable admin mode for development testing
  const enableAdminMode = async () => {
    if (!import.meta.env.DEV) return;

    // Set admin status in local storage
    setAdmin();
    setAdminAccessConfirmed(true);

    // Use debugging utilities to enhance the experience
    const debug = await AdminDebug;
    debug.enableAdminMode();

    // Add admin query parameter to URL if not already present
    if (!window.location.search.includes("admin=true")) {
      const url = new URL(window.location);
      url.searchParams.set("admin", "true");
      window.history.pushState({}, "", url);
    }

    // Force reload to apply changes
    window.location.reload();
  };

  return (
    <>
      <Header />{" "}
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-semibold text-gray-800 mb-4">
              Admin Dashboard
            </h1>
            <div className="w-24 h-0.5 bg-amber-500 mx-auto"></div>

            {/* Admin status indicator in development mode */}
            {import.meta.env.DEV && (
              <div className="mt-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    adminAccessConfirmed
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  Admin Status: {adminAccessConfirmed ? "Active" : "Inactive"}
                </span>
                {!adminAccessConfirmed && (
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <p className="text-xs text-gray-500">
                      Admin access required
                    </p>
                    <button
                      onClick={enableAdminMode}
                      className="text-xs bg-amber-500 hover:bg-amber-600 text-white py-1 px-2 rounded"
                    >
                      Enable Admin Mode (Dev)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="bg-white shadow-md rounded-md p-6">
            {/* Tabs */}
            <div className="flex gap-6 mb-8 border-b border-gray-200">
              <button
                className={`pb-4 font-medium text-sm transition-colors relative
                  ${
                    activeTab === "users"
                      ? "text-amber-700 border-b-2 border-amber-700 -mb-[2px]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                onClick={() => setActiveTab("users")}
              >
                User Management
              </button>
              <button
                className={`pb-4 font-medium text-sm transition-colors relative
                  ${
                    activeTab === "orders"
                      ? "text-amber-700 border-b-2 border-amber-700 -mb-[2px]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                onClick={() => setActiveTab("orders")}
              >
                Order Management
              </button>
            </div>

            {activeTab === "users" ? <UserManagement /> : <OrderManagement />}
          </div>
        </div>
      </main>
    </>
  );
}
