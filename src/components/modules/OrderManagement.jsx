import { useState, useEffect } from "react";
import {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  formatCurrency,
  formatDate,
} from "../../utils";
import { useNotification } from "../../context/NotificationContext";
import Swal from "sweetalert2";

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const { addNotification } = useNotification();
  // Helper function to extract phone number from user object
  const extractPhoneNumber = (user) => {
    if (!user) {
      console.log("🔍 PHONE DEBUG - No user object provided");
      return null;
    }
    
    console.log("🔍 PHONE DEBUG - Starting phone extraction for user:", Object.keys(user));
    
    const phoneFields = [
      'phoneNumber', 'phone', 'mobile', 'cellphone', 
      'telephone', 'contactNumber', 'mobileNumber',
      'contact', 'phoneNo', 'contactPhone', 'tel'
    ];
    
    // Check direct user fields
    console.log("🔍 PHONE DEBUG - Checking direct user fields...");
    for (const field of phoneFields) {
      if (user[field]) {
        const value = user[field].toString().trim();
        if (value) {
          console.log(`✅ PHONE FOUND in direct field '${field}':`, value);
          return value;
        }
      }
    }
    
    // Check nested objects
    console.log("🔍 PHONE DEBUG - Checking nested objects...");
    const nestedObjects = ['address', 'profile', 'contactInfo', 'personalInfo', 'details'];
    for (const objField of nestedObjects) {
      if (user[objField] && typeof user[objField] === 'object') {
        console.log(`🔍 PHONE DEBUG - Checking nested object '${objField}':`, Object.keys(user[objField]));
        for (const field of phoneFields) {
          if (user[objField][field]) {
            const value = user[objField][field].toString().trim();
            if (value) {
              console.log(`✅ PHONE FOUND in nested field '${objField}.${field}':`, value);
              return value;
            }
          }
        }
      }
    }
    
    // Final check: look for any field containing "phone" in the name
    console.log("🔍 PHONE DEBUG - Doing flexible field name search...");
    for (const [key, value] of Object.entries(user)) {
      if (key.toLowerCase().includes('phone') || key.toLowerCase().includes('tel') || key.toLowerCase().includes('mobile')) {
        if (value && value.toString().trim()) {
          console.log(`✅ PHONE FOUND in flexible search '${key}':`, value);
          return value.toString().trim();
        }
      }
    }
    
    console.log("❌ PHONE DEBUG - No phone number found anywhere");
    return null;
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ESC key handler for modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && showOrderDetails) {
        closeOrderDetails();
      }
    };

    if (showOrderDetails) {
      window.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent body scroll
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [showOrderDetails]);
  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log("Fetching all orders for admin...");

      const data = await getAllOrders();
      console.log("Received admin orders data:", data);

      // Sort orders by creation date, newest first
      const sortedOrders = (data || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setOrders(sortedOrders);

      // Show success message if orders found
      if (sortedOrders.length > 0) {
        console.log(
          `Successfully loaded ${sortedOrders.length} orders for admin`
        );
      }
    } catch (error) {
      console.error("Error fetching admin orders:", error);

      // Show user-friendly error message
      const errorMessage =
        error.message.includes("Authentication") ||
        error.message.includes("403")
          ? "Admin access required to view all orders"
          : error.message.includes("Invalid order ID")
          ? "There seems to be an issue with the order system. Orders will appear here once available."
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
  };  const handleViewOrderDetails = (order) => {
    console.log("📋 Order details:", order);
    console.log("👤 User data in order:", order.user);
    
    // Enhanced debug phone fields
    if (order.user) {
      console.log("🔍 PHONE DEBUG - Available user fields:", Object.keys(order.user));
      
      // Show all user data for debugging
      console.log("🔍 PHONE DEBUG - Complete user object:", order.user);
      
      // Test phone extraction
      const extractedPhone = extractPhoneNumber(order.user);
      console.log("📞 FINAL PHONE EXTRACTION RESULT:", extractedPhone);
    } else {
      console.log("❌ PHONE DEBUG - No user data available in order");
    }
    
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };
  const closeOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      
      // Update local state
      setOrders(
        orders.map((order) => {
          if (order._id === orderId) {
            const updatedOrder = { ...order, orderStatus: newStatus };
            // Auto-update payment status when order is confirmed or beyond
            if (["processing", "confirmed", "shipped", "delivered"].includes(newStatus)) {
              updatedOrder.paymentStatus = "success";
            }
            
            return updatedOrder;
          }
          return order;        })
      );
      
      // Add notification for successful status update
      const statusMessage = newStatus === "processing" 
        ? "Order confirmed and payment marked as successful"
        : ["confirmed", "shipped", "delivered"].includes(newStatus)
        ? `Order ${newStatus} and payment marked as successful`
        : `Order status updated to ${newStatus}`;
        
      addNotification(
        `Order #${orderId.slice(-8)} ${statusMessage}`,
        "success"
      );

      Swal.fire({
        title: "Success",
        text: statusMessage,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.message || "Failed to update order status",
        icon: "error",
      });
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        await deleteOrder(orderId);
        setOrders(orders.filter((order) => order._id !== orderId));

        Swal.fire("Deleted!", "Order has been deleted.", "success");
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.message || "Failed to delete order",
        icon: "error",
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.orderStatus === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">
          Order Management
        </h2>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
        >
          Refresh
        </button>
      </div>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-amber-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Orders ({orders.length})
          </button>
          {[
            "pending",
            "processing",
            "confirmed",
            "shipped",
            "delivered",
            "cancelled",
          ].map((status) => {
            const count = orders.filter(
              (order) => order.orderStatus === status
            ).length;
            return (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === status
                    ? "bg-amber-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
              </button>
            );
          })}
        </div>
      </div>
      {/* Orders List */}
      {filteredOrders.length === 0 ? (
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No {filter === "all" ? "" : filter} orders found
          </h3>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          #{order._id?.slice(-8) || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
                    </td>                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.user?.email || "Unknown User"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.user?.firstName && order.user?.lastName 
                          ? `${order.user.firstName} ${order.user.lastName}`
                          : order.user?.username || "No name available"
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {order.items?.length ? (
                          <div className="space-y-1">
                            {order.items.slice(0, 2).map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-2"
                              >
                                <span className="font-medium">
                                  {item.quantity}x
                                </span>
                                <span className="truncate">{item.name}</span>
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <div className="text-gray-500 text-xs">
                                +{order.items.length - 2} more items
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500">No items</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(order.totalAmount || 0)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.paymentStatus || "pending"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>{" "}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleViewOrderDetails(order)}
                          className="text-gray-600 hover:text-gray-900 bg-gray-50 px-3 py-1 rounded text-xs"
                        >
                          View Details
                        </button>                        {order.orderStatus === "pending" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(order._id, "processing")
                            }
                            className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded text-xs"
                          >
                            Confirm
                          </button>
                        )}
                        {order.orderStatus === "processing" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(order._id, "shipped")
                            }
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded text-xs"
                          >
                            Ship
                          </button>
                        )}
                        {order.orderStatus === "shipped" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(order._id, "delivered")
                            }
                            className="text-purple-600 hover:text-purple-900 bg-purple-50 px-3 py-1 rounded text-xs"
                          >
                            Completed
                          </button>
                        )}
                        {(order.orderStatus === "pending" ||
                          order.orderStatus === "processing") && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(order._id, "cancelled")
                            }
                            className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded text-xs"
                          >
                            Cancel
                          </button>                        )}
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>{" "}
        </div>
      )}{" "}
      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto flex items-center justify-center p-4 z-50"
          onClick={closeOrderDetails}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-serif text-luxury-dark">
                Order Details - #{selectedOrder._id?.slice(-8) || "N/A"}
              </h3>
              <button
                onClick={closeOrderDetails}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Order Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-mono">
                        #{selectedOrder._id?.slice(-8) || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span>{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          selectedOrder.orderStatus
                        )}`}
                      >
                        {selectedOrder.orderStatus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span>
                        {selectedOrder.paymentMethod?.toUpperCase() || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status:</span>                      <span
                        className={`font-medium ${
                          selectedOrder.paymentStatus === "success"
                            ? "text-green-600"
                            : selectedOrder.paymentStatus === "failed"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {selectedOrder.paymentStatus?.toUpperCase() ||
                          "PENDING"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Customer Information
                  </h4>                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span>
                        {selectedOrder.user?.firstName && selectedOrder.user?.lastName 
                          ? `${selectedOrder.user.firstName} ${selectedOrder.user.lastName}`
                          : selectedOrder.user?.username || "N/A"
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span>{selectedOrder.user?.email || "Unknown"}</span>
                    </div>                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span>
                        {(() => {
                          if (!selectedOrder.user) {
                            console.log("❌ No user object available for phone extraction");
                            return "N/A";
                          }
                          
                          const phoneNumber = extractPhoneNumber(selectedOrder.user);
                          
                          console.log("📞 Phone extraction result:", {
                            found: phoneNumber,
                            userFields: Object.keys(selectedOrder.user),
                            hasPhoneNumber: !!selectedOrder.user.phoneNumber,
                            hasPhone: !!selectedOrder.user.phone,
                            rawUser: selectedOrder.user
                          });
                          
                          return phoneNumber || "N/A";
                        })()}
                      </span>
                    </div>{/* Enhanced Debug info - shows all available user fields */}
                    {selectedOrder.user && Object.keys(selectedOrder.user).length > 0 && (
                      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                        <details>
                          <summary className="cursor-pointer text-yellow-800 font-medium">
                            🔍 Debug: Available User Data (Click to expand)
                          </summary>
                          <div className="mt-2">
                            <div className="mb-2 p-2 bg-blue-50 rounded">
                              <strong>Available Fields ({Object.keys(selectedOrder.user).length}):</strong> 
                              <div className="mt-1 grid grid-cols-3 gap-1">
                                {Object.keys(selectedOrder.user).map(field => (
                                  <span key={field} className="text-xs bg-blue-100 px-1 py-0.5 rounded">
                                    {field}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div className="mb-2 p-2 bg-green-50 rounded">
                              <strong>Phone Search Result:</strong>
                              <div className="mt-1">
                                <span className={`font-medium ${extractPhoneNumber(selectedOrder.user) ? 'text-green-600' : 'text-red-600'}`}>
                                  {extractPhoneNumber(selectedOrder.user) || "❌ No phone number found"}
                                </span>
                              </div>
                            </div>
                            
                            <div className="mb-2 p-2 bg-purple-50 rounded">
                              <strong>Phone Field Analysis:</strong>
                              <div className="grid grid-cols-2 gap-1 mt-1">
                                {['phoneNumber', 'phone', 'mobile', 'cellphone', 'telephone', 'contactNumber', 'tel', 'mobileNumber'].map(field => (
                                  <div key={field} className="text-xs">
                                    <span className="font-mono">{field}:</span> 
                                    <span className={selectedOrder.user[field] ? 'text-green-600 font-medium' : 'text-gray-400'}>
                                      {selectedOrder.user[field] ? `✅ ${selectedOrder.user[field]}` : "❌"}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="mb-2 p-2 bg-orange-50 rounded">
                              <strong>Backend Population Check:</strong>
                              <div className="mt-1 text-xs">
                                <div>Backend populated: {selectedOrder.user._id ? "✅ Yes" : "❌ No"}</div>
                                <div>Has email: {selectedOrder.user.email ? "✅ Yes" : "❌ No"}</div>
                                <div>Has username: {selectedOrder.user.username ? "✅ Yes" : "❌ No"}</div>
                                <div>Has firstName: {selectedOrder.user.firstName ? "✅ Yes" : "❌ No"}</div>
                                <div>Has lastName: {selectedOrder.user.lastName ? "✅ Yes" : "❌ No"}</div>
                              </div>
                            </div>
                            
                            <details className="mt-2">
                              <summary className="cursor-pointer text-gray-600 text-xs">Complete User Object (Raw JSON)</summary>
                              <div className="p-2 bg-gray-50 rounded mt-1">
                                <pre className="text-gray-700 whitespace-pre-wrap text-xs max-h-40 overflow-y-auto">
                                  {JSON.stringify(selectedOrder.user, null, 2)}
                                </pre>
                              </div>
                            </details>
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Shipping Address
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg text-sm">
                  <div>{selectedOrder.shippingAddress?.street}</div>
                  <div>
                    {selectedOrder.shippingAddress?.city},{" "}
                    {selectedOrder.shippingAddress?.state}{" "}
                    {selectedOrder.shippingAddress?.zipCode}
                  </div>
                  <div>{selectedOrder.shippingAddress?.country}</div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Product
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Price
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Qty
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder.items?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-4">
                            <div className="flex items-center space-x-3">
                              <img
                                src={
                                  item.imageUrl ||
                                  "/images/placeholder-product.jpg"
                                }
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.src =
                                    "/images/placeholder-product.jpg";
                                }}
                              />
                              <div>
                                <div className="font-medium text-gray-900">
                                  {item.name}
                                </div>
                                {item.selectedSize && (
                                  <div className="text-xs text-gray-500">
                                    Size: {item.selectedSize}
                                  </div>
                                )}
                                {item.selectedColor && (
                                  <div className="text-xs text-gray-500">
                                    Color: {item.selectedColor}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900">
                              {formatCurrency(item.salePrice || item.price)}
                              {item.salePrice &&
                                item.salePrice < item.price && (
                                  <div className="text-xs text-gray-500 line-through">
                                    {formatCurrency(item.price)}
                                  </div>
                                )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(
                                (item.salePrice || item.price) * item.quantity
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Total */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900">
                    Total Amount:
                  </span>
                  <span className="text-xl font-bold text-luxury-gold">
                    {formatCurrency(selectedOrder.totalAmount || 0)}
                  </span>
                </div>
              </div>

              {/* Tracking Information */}
              {selectedOrder.trackingNumber && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Tracking Information
                  </h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-700">
                      Tracking Number:{" "}
                      <span className="font-mono font-medium">
                        {selectedOrder.trackingNumber}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">
                  Quick Actions
                </h4>
                <div className="flex flex-wrap gap-2">                  {selectedOrder.orderStatus === "pending" && (
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedOrder._id, "processing");
                        closeOrderDetails();
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                    >
                      Confirm Order
                    </button>
                  )}
                  {selectedOrder.orderStatus === "processing" && (
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedOrder._id, "shipped");
                        closeOrderDetails();
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                    >
                      Ship Order
                    </button>
                  )}
                  {selectedOrder.orderStatus === "shipped" && (
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedOrder._id, "delivered");
                        closeOrderDetails();
                      }}
                      className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 text-sm"
                    >
                      Mark as Completed
                    </button>
                  )}
                  {(selectedOrder.orderStatus === "pending" ||
                    selectedOrder.orderStatus === "processing") && (
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedOrder._id, "cancelled");
                        closeOrderDetails();
                      }}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
                    >                      Cancel Order
                    </button>                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeOrderDetails}
                className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
