import { useState, useEffect } from "react";
import { getUserOrders, formatCurrency, formatDate } from "../../utils";
import Swal from "sweetalert2";

export default function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      const data = await getUserOrders();
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "Failed to fetch orders",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
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
          You haven't placed any orders yet. Start shopping to see your orders here.
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif text-luxury-dark">My Orders</h2>
        <button
          onClick={fetchUserOrders}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
        >
          Refresh
        </button>
      </div>

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
                    Order #{order._id?.slice(-8) || 'N/A'}
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
                      src={item.imageUrl || '/images/placeholder-product.jpg'}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = '/images/placeholder-product.jpg';
                      }}
                    />
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{item.name}</h5>
                      <div className="text-sm text-gray-600 space-y-1">
                        {item.selectedSize && (
                          <p>Size: {item.selectedSize}</p>
                        )}
                        {item.selectedColor && (
                          <p>Color: {item.selectedColor}</p>
                        )}
                        <p>Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency((item.salePrice || item.price) * item.quantity)}
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
                    <h5 className="font-medium text-gray-900 mb-2">Payment Information</h5>
                    <p className="text-sm text-gray-600">
                      Method: {order.paymentMethod?.toUpperCase() || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Status: <span className={`font-medium ${
                        order.paymentStatus === 'paid' ? 'text-green-600' : 
                        order.paymentStatus === 'failed' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {order.paymentStatus?.toUpperCase() || 'PENDING'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Shipping Address</h5>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{order.shippingAddress?.street}</p>
                      <p>
                        {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
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
                  <h5 className="font-medium text-blue-900 mb-1">Tracking Information</h5>
                  <p className="text-sm text-blue-700">
                    Tracking Number: <span className="font-mono">{order.trackingNumber}</span>
                  </p>
                </div>
              )}

              {/* Order Status Updates */}
              {(order.orderStatus === 'confirmed' || order.orderStatus === 'shipped' || order.orderStatus === 'delivered') && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-green-700 font-medium">
                      {order.orderStatus === 'confirmed' && 'Your order has been confirmed and is being prepared.'}
                      {order.orderStatus === 'shipped' && 'Your order has been shipped and is on the way.'}
                      {order.orderStatus === 'delivered' && 'Your order has been delivered successfully.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Cancelled Status */}
              {order.orderStatus === 'cancelled' && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-700 font-medium">
                      This order has been cancelled.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
