import { useState, useEffect } from "react";
import { getAllOrders, updateOrderStatus, deleteOrder, formatCurrency, formatDate } from "../../utils";
import Swal from "sweetalert2";

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getAllOrders();
      // Sort orders by creation date, newest first
      const sortedOrders = (data || []).sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setOrders(sortedOrders);
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.message || "Failed to fetch orders",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      // Update local state
      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, orderStatus: newStatus } : order
        )
      );

      Swal.fire({
        title: "Success",
        text: `Order status updated to ${newStatus}`,
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

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
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
        <h2 className="text-2xl font-semibold text-gray-800">Order Management</h2>
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
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Orders ({orders.length})
          </button>
          {['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(status => {
            const count = orders.filter(order => order.orderStatus === status).length;
            return (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
            No {filter === 'all' ? '' : filter} orders found
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
                          #{order._id?.slice(-8) || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.user?.email || 'Unknown User'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.user?.firstName} {order.user?.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {order.items?.length ? (
                          <div className="space-y-1">
                            {order.items.slice(0, 2).map((item, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <span className="font-medium">{item.quantity}x</span>
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
                        {order.paymentStatus || 'pending'}
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {order.orderStatus === "pending" && (
                          <button
                            onClick={() => handleStatusUpdate(order._id, "processing")}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded"
                          >
                            Process
                          </button>
                        )}
                        {order.orderStatus === "processing" && (
                          <button
                            onClick={() => handleStatusUpdate(order._id, "confirmed")}
                            className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded"
                          >
                            Confirm
                          </button>
                        )}
                        {order.orderStatus === "confirmed" && (
                          <button
                            onClick={() => handleStatusUpdate(order._id, "shipped")}
                            className="text-purple-600 hover:text-purple-900 bg-purple-50 px-3 py-1 rounded"
                          >
                            Ship
                          </button>
                        )}
                        {order.orderStatus === "shipped" && (
                          <button
                            onClick={() => handleStatusUpdate(order._id, "delivered")}
                            className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded"
                          >
                            Delivered
                          </button>
                        )}
                        {(order.orderStatus === "pending" || order.orderStatus === "processing") && (
                          <button
                            onClick={() => handleStatusUpdate(order._id, "cancelled")}
                            className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
