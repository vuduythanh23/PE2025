import { useState, useEffect } from "react";
import {
  getUserOrders,
  formatCurrency,
  formatDate,
  normalizeOrdersPaymentStatus,
} from "../../utils";
import { useNotification } from "../../context/NotificationContext";
import Swal from "sweetalert2";

export default function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notifications } = useNotification();
  useEffect(() => {
    fetchUserOrders();
  }, []);

  // Auto-refresh when notifications contain order updates
  useEffect(() => {
    if (notifications && notifications.length > 0) {
      const hasOrderUpdate = notifications.some(
        (notification) =>
          notification.message && notification.message.includes("Order #")
      );

      if (hasOrderUpdate) {
        console.log("Order update notification detected, refreshing orders...");
        setTimeout(() => {
          fetchUserOrders();
        }, 1000); // Delay to allow backend to process
      }
    }
  }, [notifications]);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      console.log("Fetching user orders...");

      const data = await getUserOrders();
      console.log("Received orders data:", data);

      // Sort orders by creation date, newest first
      const sortedOrders = (data || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setOrders(sortedOrders);

      // Show success message if orders found
      if (sortedOrders.length > 0) {
        console.log(`Successfully loaded ${sortedOrders.length} orders`);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);

      // Show user-friendly error message
      const errorMessage = error.message.includes("Authentication")
        ? "Please log in to view your orders"
        : error.message.includes("Invalid order ID")
        ? "There seems to be an issue with the order system. Your orders will appear here once available."
        : error.message || "Failed to fetch orders";

      Swal.fire({
        title: "Unable to Load Orders",
        text: errorMessage,
        icon: "info",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  }; // Function to refresh orders and fix payment status
  const refreshOrdersAndFixPayment = async () => {
    console.log("🔄 Refreshing orders and fixing payment status...");

    try {
      // Fetch fresh orders (which will already be normalized by the API)
      const data = await getUserOrders();

      // Count how many orders have been auto-fixed
      const beforeNormalization = data.length;
      const afterNormalization = normalizeOrdersPaymentStatus(data);
      const fixedCount = afterNormalization.filter(
        (order, i) => order.paymentStatus !== data[i]?.paymentStatus
      ).length;

      setOrders(afterNormalization);

      // Show feedback to user based on results
      if (fixedCount > 0) {
        Swal.fire({
          title: "Orders Refreshed & Payment Status Fixed!",
          text: `Refreshed orders and fixed payment status for ${fixedCount} order(s) ✅`,
          icon: "success",
          timer: 3000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          title: "Orders Refreshed",
          text: "Orders refreshed successfully. All payment statuses are already correct ✅",
          icon: "info",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error refreshing orders:", error);
      Swal.fire({
        title: "Refresh Failed",
        text: "Failed to refresh orders. Please try again.",
        icon: "error",
      });
    }
  };
  // Auto-fix payment status on mount and when orders change
  useEffect(() => {
    if (orders.length > 0) {
      const needsFix = orders.some(
        (order) =>
          ["processing", "confirmed", "shipped", "delivered"].includes(
            order.orderStatus
          ) && order.paymentStatus === "pending"
      );

      if (needsFix) {
        console.log("Found orders with incorrect payment status, fixing...");
        setTimeout(() => {
          // Just fix without refreshing on auto-fix
          setOrders((prevOrders) =>
            prevOrders.map((order) => {
              if (
                ["processing", "confirmed", "shipped", "delivered"].includes(
                  order.orderStatus
                ) &&
                order.paymentStatus === "pending"
              ) {
                console.log(
                  `Auto-fixing payment status for order ${order._id}: pending → paid`
                );
                return {
                  ...order,
                  paymentStatus: "paid",
                };
              }
              return order;
            })
          );
        }, 500);
      }
    }
  }, [orders]);

  // Order status timeline component
  const OrderStatusTimeline = ({ currentStatus }) => {
    const statuses = [
      { key: "pending", label: "Pending", icon: "🕐" },
      { key: "processing", label: "Processing", icon: "⚙️" },
      { key: "confirmed", label: "Confirmed", icon: "✅" },
      { key: "shipped", label: "Shipped", icon: "🚚" },
      { key: "delivered", label: "Delivered", icon: "📦" },
    ];

    const cancelledStatuses = ["cancelled"];

    if (cancelledStatuses.includes(currentStatus)) {
      return (
        <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center text-red-700">
            <span className="text-lg mr-2">❌</span>
            <span className="font-medium">Order Cancelled</span>
          </div>
        </div>
      );
    }

    const currentIndex = statuses.findIndex(
      (status) => status.key === currentStatus
    );

    return (
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h6 className="text-sm font-medium text-gray-700 mb-3">
          Order Progress
        </h6>
        <div className="flex items-center space-x-2">
          {statuses.map((status, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={status.key} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    isCompleted
                      ? "bg-green-500 border-green-500 text-white"
                      : "bg-gray-200 border-gray-300 text-gray-500"
                  } ${isCurrent ? "ring-2 ring-green-300" : ""}`}
                >
                  <span className="text-xs">{status.icon}</span>
                </div>
                <div className="ml-1 text-xs text-center">
                  <div
                    className={`${
                      isCompleted
                        ? "text-green-600 font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {status.label}
                  </div>
                </div>
                {index < statuses.length - 1 && (
                  <div
                    className={`w-8 h-0.5 mx-2 ${
                      index < currentIndex ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "confirmed":
      case "shipped":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "processing":
        return "Processing";
      case "confirmed":
        return "Confirmed";
      case "shipped":
        return "Shipped";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-luxury-gold"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-gray-400 mb-4">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-serif text-gray-900 mb-2">No Orders Yet</h3>
        <p className="text-gray-600 mb-4">
          You haven't placed any orders yet. Start shopping to see your orders
          here.
        </p>
        <a
          href="/products"
          className="inline-flex items-center px-4 py-2 bg-luxury-gold text-white rounded-md hover:bg-luxury-dark transition-colors"
        >
          Start Shopping
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {" "}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif text-luxury-dark">My Orders</h2>
        <div className="flex gap-2">
          <button
            onClick={refreshOrdersAndFixPayment}
            className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
            title="Refresh orders and fix payment status"
          >
            ⟳ Refresh & Fix Payment
          </button>
        </div>
      </div>
      {/* Order Summary Cards */}
      {orders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">
              {orders.length}
            </div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-yellow-600">
              {
                orders.filter((o) =>
                  ["pending", "processing"].includes(o.orderStatus)
                ).length
              }
            </div>
            <div className="text-sm text-gray-600">Pending Orders</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {
                orders.filter((o) =>
                  ["confirmed", "shipped", "delivered"].includes(o.orderStatus)
                ).length
              }
            </div>
            <div className="text-sm text-gray-600">Active Orders</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-luxury-gold">
              {formatCurrency(
                orders.reduce(
                  (total, order) => total + (order.totalAmount || 0),
                  0
                )
              )}
            </div>
            <div className="text-sm text-gray-600">Total Spent</div>
          </div>
        </div>
      )}
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Order Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-serif text-luxury-dark">
                    Order #{order._id?.slice(-8) || "N/A"}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Placed on {formatDate(order.createdAt || new Date())}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      order.orderStatus
                    )}`}
                  >
                    {getStatusText(order.orderStatus)}
                  </span>
                  <p className="text-lg font-serif text-luxury-gold mt-2">
                    {formatCurrency(order.totalAmount || 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-6">
              <h4 className="font-medium text-gray-900 mb-4">Items</h4>
              <div className="space-y-3">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <img
                      src={item.imageUrl || "/images/placeholder-product.jpg"}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = "/images/placeholder-product.jpg";
                      }}
                    />
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{item.name}</h5>
                      <div className="text-sm text-gray-600 space-y-1">
                        {item.selectedSize && <p>Size: {item.selectedSize}</p>}
                        {item.selectedColor && (
                          <p>Color: {item.selectedColor}</p>
                        )}
                        <p>Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(
                          (item.salePrice || item.price) * item.quantity
                        )}
                      </p>
                      {item.salePrice && item.salePrice < item.price && (
                        <p className="text-sm text-gray-500 line-through">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {/* Payment & Shipping Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">
                      Payment Information
                    </h5>
                    <p className="text-sm text-gray-600">
                      Method: {order.paymentMethod?.toUpperCase() || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Payment Status:{" "}
                      <span
                        className={`font-medium ${
                          order.paymentStatus === "paid"
                            ? "text-green-600"
                            : order.paymentStatus === "failed"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {order.paymentStatus?.toUpperCase() || "PENDING"}
                      </span>
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">
                      Shipping Address
                    </h5>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{order.shippingAddress?.street}</p>
                      <p>
                        {order.shippingAddress?.city},{" "}
                        {order.shippingAddress?.state}{" "}
                        {order.shippingAddress?.zipCode}
                      </p>
                      <p>{order.shippingAddress?.country}</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Tracking Number */}
              {order.trackingNumber && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-1">
                    Tracking Information
                  </h5>
                  <p className="text-sm text-blue-700">
                    Tracking Number:{" "}
                    <span className="font-mono">{order.trackingNumber}</span>
                  </p>
                </div>
              )}{" "}
              {/* Order Status Updates */}
              {(order.orderStatus === "confirmed" ||
                order.orderStatus === "shipped" ||
                order.orderStatus === "delivered") && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-400 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm text-green-700 font-medium">
                      {order.orderStatus === "confirmed" &&
                        "Your order has been confirmed and is being prepared."}
                      {order.orderStatus === "shipped" &&
                        "Your order has been shipped and is on the way."}
                      {order.orderStatus === "delivered" &&
                        "Your order has been delivered successfully."}
                    </p>
                  </div>
                </div>
              )}
              {/* Cancelled Status */}
              {order.orderStatus === "cancelled" && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-red-400 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm text-red-700 font-medium">
                      This order has been cancelled.
                    </p>
                  </div>
                </div>
              )}
              {/* Order Status Timeline */}
              <OrderStatusTimeline currentStatus={order.orderStatus} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
