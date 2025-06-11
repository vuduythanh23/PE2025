// filepath: orders.controller.js - Backend controller for orders API
// This controller handles all order-related operations with proper error handling

const Order = require("../models/Order"); // Assuming you have an Order model
const User = require("../models/User"); // Assuming you have a User model
const Cart = require("../models/Cart"); // Assuming you have a Cart model

// =============================================================================
// ADMIN CONTROLLERS
// =============================================================================

/**
 * Get all orders from all users (Admin only)
 * Route: GET /api/orders/
 */
const getAllOrdersController = async (req, res) => {
  try {
    console.log("🔧 Admin: Getting all orders from all users");    const orders = await Order.find({})
      .populate("user", "email username firstName lastName phoneNumber")
      .populate("items.product")
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${orders.length} total orders`);

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("❌ Error getting all orders:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching orders",
      error: error.message,
    });
  }
};

/**
 * Get orders for a specific user (Admin only)
 * Route: GET /api/orders/user/:userId
 */
const getOrdersByUserIdController = async (req, res) => {
  try {
    const { userId } = req.params;

    // If called from /my-orders route, use authenticated user's ID
    const targetUserId = userId || req.user._id;

    console.log(`🔧 Getting orders for user: ${targetUserId}`);

    // Verify user exists
    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }    const orders = await Order.find({ user: targetUserId })
      .populate("user", "email username firstName lastName phoneNumber")
      .populate("items.product")
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${orders.length} orders for user ${targetUserId}`);

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("❌ Error getting user orders:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user orders",
      error: error.message,
    });
  }
};

// =============================================================================
// USER CONTROLLERS
// =============================================================================

/**
 * Get single order by ID
 * Route: GET /api/orders/:orderId
 */
const getOrderByIdController = async (req, res) => {
  try {
    const { orderId } = req.params;

    console.log(`🔧 Getting order by ID: ${orderId}`);

    // Validate orderId format (assuming MongoDB ObjectId)
    if (!orderId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format",
      });
    }    const order = await Order.findById(orderId)
      .populate("user", "email username firstName lastName phoneNumber")
      .populate("items.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if user owns this order or is admin
    if (
      !req.user.isAdmin &&
      order.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this order",
      });
    }

    console.log(`✅ Found order: ${orderId}`);

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("❌ Error getting order by ID:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching order",
      error: error.message,
    });
  }
};

/**
 * Create order from cart
 * Route: POST /api/orders/from-cart
 */
const createOrderFromCartController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { shippingAddress, paymentMethod } = req.body;

    console.log(`🔧 Creating order from cart for user: ${userId}`);

    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // Calculate total
    const totalAmount = cart.items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0); // Create order
    const order = new Order({
      user: userId,
      items: cart.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      })),
      totalAmount,
      shippingAddress,
      paymentMethod,
      orderStatus: "pending", // Use orderStatus instead of status
      paymentStatus: "pending",
    });

    await order.save();

    // Clear cart after order creation
    await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });

    console.log(`✅ Order created from cart: ${order._id}`);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    console.error("❌ Error creating order from cart:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating order",
      error: error.message,
    });
  }
};

/**
 * Create direct order for single product
 * Route: POST /api/orders/direct
 */
const createDirectOrderController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity, shippingAddress, paymentMethod } = req.body;

    console.log(`🔧 Creating direct order for user: ${userId}`);

    // Validate product exists (assuming you have a Product model)
    const Product = require("../models/Product");
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check stock availability
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock",
      });
    }

    const totalAmount = product.price * quantity; // Create order
    const order = new Order({
      user: userId,
      items: [
        {
          product: productId,
          quantity,
          price: product.price,
        },
      ],
      totalAmount,
      shippingAddress,
      paymentMethod,
      orderStatus: "pending", // Use orderStatus instead of status
      paymentStatus: "pending",
    });

    await order.save();

    console.log(`✅ Direct order created: ${order._id}`);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    console.error("❌ Error creating direct order:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating order",
      error: error.message,
    });
  }
};

// =============================================================================
// ADMIN UPDATE CONTROLLERS
// =============================================================================

/**
 * Update order status (Admin only)
 * Route: PATCH /api/orders/:orderId/status
 */
const updateOrderStatusController = async (req, res) => {  try {
    const { orderId } = req.params;
    const { status, orderStatus, newStatus, paymentStatus } = req.body; // Accept payment status too

    // Use newStatus first (based on error image suggestion), then orderStatus, then status
    const statusToUpdate = newStatus || orderStatus || status;

    if (!statusToUpdate) {
      return res.status(400).json({
        success: false,
        message: 'New status is required. Use "newStatus", "orderStatus", or "status" field.',
      });
    }

    console.log(
      `🔧 Admin: Updating order ${orderId} orderStatus to: ${statusToUpdate}`
    );

    // Prepare update data
    const updateData = { orderStatus: statusToUpdate };    // Auto-update payment status when confirming order or beyond
    if (["processing", "confirmed", "shipped", "delivered"].includes(statusToUpdate) || paymentStatus) {
      updateData.paymentStatus = paymentStatus || "success";
      console.log(`💳 Also updating payment status to: ${updateData.paymentStatus} (order status: ${statusToUpdate})`);
    }const validStatuses = [
      "pending",
      "processing",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(statusToUpdate)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status value. Must be one of: ${validStatuses.join(
          ", "
        )}`,
      });
    }    const order = await Order.findByIdAndUpdate(
      orderId,
      updateData, // Use the prepared update data with both order and payment status
      { new: true, runValidators: true }
    )
      .populate("user", "email username firstName lastName phoneNumber")
      .populate("items.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    console.log(`✅ Order updated: ${orderId} -> orderStatus: ${statusToUpdate}, paymentStatus: ${updateData.paymentStatus || 'unchanged'}`);

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("❌ Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating order status",
      error: error.message,
    });
  }
};

/**
 * Update payment status (Admin only)
 * Route: PATCH /api/orders/:orderId/payment-status
 */
const updatePaymentStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    console.log(
      `🔧 Admin: Updating order ${orderId} payment status to: ${paymentStatus}`
    );

    const validPaymentStatuses = ["pending", "success", "failed", "refunded"];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status value",
      });
    }    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus },
      { new: true, runValidators: true }
    )
      .populate("user", "email username firstName lastName phoneNumber")
      .populate("items.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    console.log(`✅ Payment status updated: ${orderId} -> ${paymentStatus}`);

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("❌ Error updating payment status:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating payment status",
      error: error.message,
    });
  }
};

/**
 * Delete order (Admin only)
 * Route: DELETE /api/orders/:orderId
 */
const deleteOrderController = async (req, res) => {
  try {
    const { orderId } = req.params;

    console.log(`🔧 Admin: Deleting order: ${orderId}`);

    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    console.log(`✅ Order deleted: ${orderId}`);

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting order:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting order",
      error: error.message,
    });
  }
};

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  // Admin controllers
  getAllOrdersController,
  getOrdersByUserIdController,
  updateOrderStatusController,
  updatePaymentStatusController,
  deleteOrderController,

  // User controllers
  getOrderByIdController,
  createOrderFromCartController,
  createDirectOrderController,
};

// =============================================================================
// CONTROLLER MAPPING FOR ROUTES
// =============================================================================
/*
ROUTE MAPPING:
1. GET /                       -> getAllOrdersController (Admin)
2. GET /user/:userId           -> getOrdersByUserIdController (Admin)
3. GET /my-orders              -> getOrdersByUserIdController (User)
4. POST /from-cart             -> createOrderFromCartController (User)
5. POST /direct                -> createDirectOrderController (User)
6. GET /:orderId               -> getOrderByIdController (User/Admin)
7. PATCH /:orderId/status      -> updateOrderStatusController (Admin)
8. PATCH /:orderId/payment-status -> updatePaymentStatusController (Admin)
9. DELETE /:orderId            -> deleteOrderController (Admin)
*/
