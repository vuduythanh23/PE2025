import { useState, useEffect } from "react";
import { API_CONFIG } from "../../utils/constants/api.js";
import { getAuthHeaders } from "../../utils/api/base.js";

export default function BackendStatusIndicator() {
  const [status, setStatus] = useState({
    backend: "checking",
    auth: "checking",
    orders: "checking",
  });

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    const newStatus = {
      backend: "checking",
      auth: "checking",
      orders: "checking",
    };

    try {
      // Test basic backend connectivity
      const response = await fetch(`${API_CONFIG.BASE_URL}/products`, {
        method: "HEAD",
        signal: AbortSignal.timeout(5000),
      });
      newStatus.backend = response.ok ? "online" : "error";
    } catch (error) {
      newStatus.backend = "offline";
    }

    try {
      // Test authentication status
      const headers = getAuthHeaders();
      const hasAuth = !!headers.Authorization;
      newStatus.auth = hasAuth ? "authenticated" : "unauthenticated";
    } catch (error) {
      newStatus.auth = "error";
    }
    try {
      // Test orders endpoint specifically
      const headers = getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BASE_URL}/orders/my-orders`, {
        method: "HEAD",
        headers,
        signal: AbortSignal.timeout(5000),
      });

      if (response.status === 401) {
        newStatus.orders = "unauthorized";
      } else if (response.status === 400) {
        // Check if it's the "Invalid order ID" error
        const textResponse = await fetch(
          `${API_CONFIG.BASE_URL}/orders/my-orders`,
          {
            method: "GET",
            headers,
            signal: AbortSignal.timeout(5000),
          }
        );
        const errorText = await textResponse.text();
        if (errorText.includes("Invalid order ID")) {
          newStatus.orders = "route_error";
        } else {
          newStatus.orders = "bad_request";
        }
      } else if (response.ok) {
        newStatus.orders = "available";
      } else {
        newStatus.orders = "error";
      }
    } catch (error) {
      newStatus.orders = "unavailable";
    }

    setStatus(newStatus);
  };
  const getStatusColor = (statusValue) => {
    switch (statusValue) {
      case "online":
      case "available":
      case "authenticated":
        return "text-green-600";
      case "checking":
        return "text-yellow-600";
      case "unauthorized":
      case "unauthenticated":
        return "text-orange-600";
      case "route_error":
      case "bad_request":
        return "text-purple-600";
      case "offline":
      case "unavailable":
      case "error":
      default:
        return "text-red-600";
    }
  };
  const getStatusIcon = (statusValue) => {
    switch (statusValue) {
      case "online":
      case "available":
      case "authenticated":
        return "🟢";
      case "checking":
        return "🟡";
      case "unauthorized":
      case "unauthenticated":
        return "🟠";
      case "route_error":
      case "bad_request":
        return "🟣";
      case "offline":
      case "unavailable":
      case "error":
      default:
        return "🔴";
    }
  };

  // Only show in development mode
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-3 border text-xs z-50">
      <div className="font-medium text-gray-700 mb-2">Backend Status</div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span>Backend:</span>
          <span
            className={`flex items-center ${getStatusColor(status.backend)}`}
          >
            {getStatusIcon(status.backend)} {status.backend}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span>Auth:</span>
          <span className={`flex items-center ${getStatusColor(status.auth)}`}>
            {getStatusIcon(status.auth)} {status.auth}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span>Orders:</span>
          <span
            className={`flex items-center ${getStatusColor(status.orders)}`}
          >
            {getStatusIcon(status.orders)} {status.orders}
          </span>
        </div>
      </div>

      <button
        onClick={checkBackendStatus}
        className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
      >
        Refresh
      </button>
    </div>
  );
}
