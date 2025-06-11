import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { getUserOrders, isAuthenticated } from "../utils";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [orderUpdates, setOrderUpdates] = useState([]);
  const [lastOrderCheck, setLastOrderCheck] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  
  // Temporary flag to disable order polling until backend is stable
  const ENABLE_ORDER_POLLING = false; // Set to true when backend orders API is stable

  // Poll for order updates only for authenticated users
  useEffect(() => {
    if (!isAuthenticated() || !ENABLE_ORDER_POLLING) {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);
    const checkForOrderUpdates = async () => {
      try {
        const orders = await getUserOrders();
        const currentTime = Date.now();

        // Handle case when orders is null, undefined, or empty
        if (!orders || !Array.isArray(orders)) {
          setOrderUpdates([]);
          setLastOrderCheck(currentTime);
          return;
        }

        if (lastOrderCheck && orders.length > 0) {
          // Find new orders or status changes
          const newUpdates = orders.filter((order) => {
            const orderTime = new Date(
              order.updatedAt || order.createdAt
            ).getTime();
            return orderTime > lastOrderCheck;
          });

          // Create notifications for recent updates
          newUpdates.forEach((order) => {
            let message = "";
            let type = "info";

            switch (order.orderStatus) {
              case "processing":
                message = `Order #${order._id?.slice(
                  -8
                ) || 'N/A'} is now being processed`;
                type = "info";
                break;
              case "confirmed":
                message = `Order #${order._id.slice(-8)} has been confirmed!`;
                type = "success";
                break;
              case "shipped":
                message = `Order #${order._id.slice(-8)} has been shipped!`;
                type = "success";
                break;
              case "delivered":
                message = `Order #${order._id.slice(-8)} has been delivered!`;
                type = "success";
                break;
              case "cancelled":
                message = `Order #${order._id.slice(-8)} has been cancelled`;
                type = "error";
                break;
              default:
                return; // Don't show notification for pending orders
            }

            if (message) {
              addNotification(message, type, order._id);
            }
          });
        }        setLastOrderCheck(currentTime);
        setOrderUpdates(orders || []);
      } catch (error) {
        console.error("Error checking for order updates:", error);
        
        // Handle specific API errors
        if (error.message?.includes("Invalid order ID") || 
            error.message?.includes("400") ||
            error.message?.includes("Bad Request")) {
          // This is likely because user has no orders yet - not an error
          setOrderUpdates([]);
          setLastOrderCheck(Date.now());
          return;
        }

        // For other errors, reduce polling frequency to avoid spam
        if (error.message?.includes("404") || 
            error.message?.includes("Not Found")) {
          // API endpoint doesn't exist, stop polling
          console.warn("Orders API endpoint not available, stopping polling");
          setIsPolling(false);
          return;
        }

        // Don't spam error notifications, just log for development
        if (process.env.NODE_ENV === "development") {
          console.log("Order update check failed:", error.message);
        }
      }
    };    // Check for updates every 60 seconds (reduced frequency), but only when page is visible
    let interval;

    const startPolling = () => {
      if (interval) clearInterval(interval);
      if (!isPolling) return; // Don't start if polling is disabled
      interval = setInterval(checkForOrderUpdates, 60000); // Increased to 60 seconds
      // Do initial check after a delay to avoid immediate API calls on page load
      setTimeout(checkForOrderUpdates, 5000);
    };

    const stopPolling = () => {
      if (interval) clearInterval(interval);
    };

    // Start polling when page becomes visible, stop when hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else if (isAuthenticated()) {
        startPolling();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Start initial polling
    startPolling();

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      setIsPolling(false);
    };
  }, [lastOrderCheck]);

  const addNotification = useCallback(
    (message, type = "info", orderId = null) => {
      const notification = {
        id: Date.now() + Math.random(),
        message,
        type,
        orderId,
        timestamp: new Date(),
      };

      setNotifications((prev) => [...prev, notification]);

      // Auto remove after 5 seconds
      setTimeout(() => {
        removeNotification(notification.id);
      }, 5000);
    },
    []
  );

  const removeNotification = useCallback((id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);
  const value = {
    notifications,
    orderUpdates,
    isPolling,
    addNotification,
    removeNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
}
