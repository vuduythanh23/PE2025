// Fixed Backend Orders Controller - Payment Status Auto-Update
// This controller ensures payment status is automatically updated when order status changes

const Order = require("../models/order.model");
const Product = require("../models/product.model");

/**
 * Update Order Status Controller - WITH AUTOMATIC PAYMENT STATUS UPDATE
 * Route: PATCH /api/orders/:orderId/status
 */
const updateOrderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus, status, newStatus } = req.body;

    // Get the new status (accept multiple field names for compatibility)
    const newOrderStatus = orderStatus || status || newStatus;

    if (!newOrderStatus) {
      return res.status(400).json({
        success: false,
        message:
          "New order status is required (orderStatus, status, or newStatus)",
      });
    }

    // Validate status values
    const validStatuses = [
      "pending",
      "processing",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(newOrderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Prepare update data
    const updateData = {
      orderStatus: newOrderStatus,    };

    // 🎯 AUTO-UPDATE PAYMENT STATUS TO "PAID" WHEN ORDER IS CONFIRMED
    if (
      ["processing", "confirmed", "shipped", "delivered"].includes(
        newOrderStatus
      )
    ) {
      updateData.paymentStatus = "paid";
    }

    // Update the order
    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("user", "email username firstName lastName phoneNumber")
      .populate("items.product");

    res.status(200).json({
      success: true,
      message: `Order status updated to ${newOrderStatus}${
        updateData.paymentStatus ? " and payment status updated to paid" : ""
      }`,
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Update Payment Status Controller - ACCEPTS "PAID" STATUS
 * Route: PATCH /api/orders/:orderId/payment-status
 */
const updatePaymentStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    if (!paymentStatus) {
      return res.status(400).json({
        success: false,
        message: "Payment status is required",
      });
    }

    // Validate payment status values - INCLUDE "PAID"
    const validPaymentStatuses = ["pending", "paid", "failed", "refunded"];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment status. Must be one of: ${validPaymentStatuses.join(
          ", "
        )}`,
      });
    }

    // Update the payment status
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus },
      { new: true, runValidators: true }
    )
      .populate("user", "email username firstName lastName phoneNumber")
      .populate("items.product");

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Payment status updated to ${paymentStatus}`,
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Get All Orders Controller - WITH FULL USER POPULATION
 * Route: GET /api/orders/
 */
const getAllOrdersController = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "email username firstName lastName phoneNumber")
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Get Orders By User ID Controller - WITH FULL USER POPULATION
 * Route: GET /api/orders/user/:userId AND GET /api/orders/my-orders
 */
const getOrdersByUserIdController = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUserId = userId || req.user?.id;

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const orders = await Order.find({ user: targetUserId })
      .populate("user", "email username firstName lastName phoneNumber")
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "User orders retrieved successfully",
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Get Order By ID Controller - WITH FULL USER POPULATION
 * Route: GET /api/orders/:orderId
 */
const getOrderByIdController = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("user", "email username firstName lastName phoneNumber")
      .populate("items.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order retrieved successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Create Order From Cart Controller - WITH "PAID" PAYMENT STATUS SUPPORT
 */
const createOrderFromCartController = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items are required",
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    // Calculate total amount
    let totalAmount = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.productId} not found`,
        });
      }

      const effectivePrice = product.salePrice || product.price;
      const itemTotal = effectivePrice * item.quantity;
      totalAmount += itemTotal;

      processedItems.push({
        product: item.productId,
        name: product.name,
        price: product.price,
        salePrice: product.salePrice,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        imageUrl: product.imageUrl,
      });
    }

    // Create order with default "pending" statuses
    const newOrder = new Order({
      user: userId,
      items: processedItems,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || "credit_card",
      orderStatus: "pending",
      paymentStatus: "pending", // Will be auto-updated to "paid" when confirmed
    });

    await newOrder.save();

    // Populate the created order for response
    const populatedOrder = await Order.findById(newOrder._id)
      .populate("user", "email username firstName lastName phoneNumber")
      .populate("items.product");

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: populatedOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Delete Order Controller
 * Route: DELETE /api/orders/:orderId
 */
const deleteOrderController = async (req, res) => {
  try {
    const { orderId } = req.params;

    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
      data: deletedOrder,
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  updateOrderStatusController,
  updatePaymentStatusController,
  getAllOrdersController,
  getOrdersByUserIdController,
  getOrderByIdController,
  createOrderFromCartController,
  deleteOrderController,
};
