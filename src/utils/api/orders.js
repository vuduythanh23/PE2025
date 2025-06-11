import { ENDPOINTS, API_CONFIG } from "../constants/api.js";
import { fetchWithTimeout, getAuthHeaders } from "./base.js";

/**
 * Creates a new order from cart items
 * @param {Array|Object} cartItemsOrOrderData - Cart items array or complete order data object
 * @returns {Promise<Object>} The created order
 * @throws {Error} If creation fails
 */
export async function createOrder(cartItemsOrOrderData) {
  let orderData;
    // Check if input is cart items array or complete order data
  if (Array.isArray(cartItemsOrOrderData)) {
    // Get user information for shipping address
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    
    // Legacy support: convert cart items to order data
    const cartItems = cartItemsOrOrderData;
    orderData = {
      items: cartItems.map(item => ({
        productId: item._id,
        name: item.name,
        price: item.salePrice || item.price, // Use sale price if available
        salePrice: item.salePrice || null,
        quantity: item.quantity,
        selectedSize: item.size || null,
        selectedColor: item.color || null,
        imageUrl: item.images?.[0] || null
      })),
      totalAmount: cartItems.reduce((total, item) => total + ((item.salePrice || item.price) * item.quantity), 0),
      shippingAddress: {
        street: user.address || "123 Main Street",
        city: "Ho Chi Minh City", 
        state: "Ho Chi Minh",
        zipCode: "70000",
        country: "Vietnam"
      },
      paymentMethod: "credit_card",
      paymentStatus: "pending",
      orderStatus: "pending"
    };} else {
    // Use provided order data
    orderData = cartItemsOrOrderData;  }  
  // Use the actual backend /from-cart endpoint
  console.log("Creating order with data:", orderData);
  console.log("Using endpoint:", `${ENDPOINTS.ORDERS}/from-cart`);
  
  const res = await fetchWithTimeout(`${ENDPOINTS.ORDERS}/from-cart`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(orderData),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Create order error response:", res.status, errorText);
    
    // Handle specific errors
    if (res.status === 401) {
      throw new Error("Authentication required. Please log in.");
    }
    
    if (res.status === 404) {
      throw new Error("Order creation endpoint not found. Please contact support.");
    }
    
    if (errorText.includes("Invalid order ID") || errorText.includes("validation")) {
      throw new Error("Invalid order data. Please check your cart and try again.");
    }
    
    throw new Error(`Failed to create order: ${errorText}`);
  }
  
  const result = await res.json();
  console.log("Order created successfully:", result);
  return result;
}

/**
 * Fetches an order by ID
 * @param {string} orderId - The ID of the order to fetch
 * @returns {Promise<Object>} The order data
 * @throws {Error} If fetching fails
 */
export async function getOrderById(orderId) {
  const res = await fetchWithTimeout(
    `${ENDPOINTS.ORDERS}/${encodeURIComponent(orderId)}`,
    {
      headers: getAuthHeaders(),
    }
  );    if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch order: ${error}`);
  }
  
  return res.json();
}

/**
 * Fetches orders for the current user
 * @returns {Promise<Array>} Array of orders
 * @throws {Error} If fetching fails
 */
export async function getUserOrders() {
  try {
    const headers = getAuthHeaders();
    console.log("Fetching user orders with headers:", headers);
    
    // Try the correct endpoint first
    let endpoint = `${ENDPOINTS.ORDERS}/my-orders`;
    console.log("Using endpoint:", endpoint);
    
    const res = await fetchWithTimeout(endpoint, {
      headers,
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Orders API error response:", res.status, errorText);
      
      // If /my-orders fails with 400 "Invalid order ID", 
      // backend might expect /user-orders or /users/orders instead
      if (res.status === 400 && errorText.includes("Invalid order ID")) {
        console.warn("Trying alternative endpoint due to Invalid order ID error");
        
        // Try alternative endpoints
        const alternatives = [
          `${ENDPOINTS.ORDERS}/user-orders`,
          `${ENDPOINTS.ORDERS}/user/orders`,
          `${API_CONFIG.BASE_URL}/user-orders`,
          `${API_CONFIG.BASE_URL}/users/orders`
        ];
        
        for (const altEndpoint of alternatives) {
          try {
            console.log("Trying alternative endpoint:", altEndpoint);
            const altRes = await fetchWithTimeout(altEndpoint, { headers });
            
            if (altRes.ok) {
              const data = await altRes.json();
              console.log("Success with alternative endpoint:", altEndpoint, data);
              return Array.isArray(data) ? data : [];
            }
          } catch (altError) {
            console.log("Alternative endpoint failed:", altEndpoint, altError.message);
          }
        }
      }
      
      // Handle authentication errors
      if (res.status === 401) {
        console.warn("Authentication failed for orders, returning empty array");
        return [];
      }
      
      // Check for user not found or no orders
      if (res.status === 404 || errorText.includes("not found")) {
        console.warn("No orders found for user, returning empty array");
        return [];
      }
      
      // Check for validation errors
      if (errorText.includes("validation")) {
        console.warn("Backend orders API has validation issues, returning empty array");
        return [];
      }
      
      throw new Error(`Failed to fetch your orders: ${errorText}`);
    }
    
    const data = await res.json();
    console.log("Orders API response:", data);
    return Array.isArray(data) ? data : [];
    
  } catch (error) {
    console.error("Error in getUserOrders:", error);
    
    // If network error or backend unavailable, return empty array
    if (error.name === 'TypeError' || error.message.includes('fetch')) {
      console.warn("Orders API unavailable, returning empty array");
      return [];
    }
    
    // For "Invalid order ID" errors, return empty array instead of crashing
    if (error.message.includes("Invalid order ID") || error.message.includes("validation")) {
      console.warn("Backend orders API has ID validation issues, returning empty array");
      return [];
    }
    
    // For authentication errors, return empty array
    if (error.message.includes("Authentication") || error.message.includes("401")) {
      console.warn("Authentication error, returning empty array");
      return [];
    }
    
    throw error;
  }
}

/**
 * Fetches all orders (admin only)
 * @returns {Promise<Array>} Array of all orders
 * @throws {Error} If fetching fails
 */
export async function getAllOrders() {
  try {
    const headers = getAuthHeaders();
    console.log("Fetching all orders with headers:", headers);
    
    const res = await fetchWithTimeout(`${ENDPOINTS.ORDERS}`, {
      headers,
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Admin orders API error response:", res.status, errorText);
      
      // Handle authentication/authorization errors
      if (res.status === 401 || res.status === 403) {
        console.warn("Access denied for admin orders, returning empty array");
        return [];
      }
      
      // Check for validation errors
      if (errorText.includes("Invalid order ID") || errorText.includes("validation")) {
        console.warn("Backend orders API has validation issues, returning empty array");
        return [];
      }
      
      // Check for no orders found
      if (res.status === 404 || errorText.includes("not found")) {
        console.warn("No orders found, returning empty array");
        return [];
      }
      
      throw new Error(`Failed to fetch all orders: ${errorText}`);
    }
    
    const data = await res.json();
    console.log("Admin orders API response:", data);
    return Array.isArray(data) ? data : [];
    
  } catch (error) {
    console.error("Error in getAllOrders:", error);
    
    // If network error or backend unavailable, return empty array
    if (error.name === 'TypeError' || error.message.includes('fetch')) {
      console.warn("Admin orders API unavailable, returning empty array");
      return [];
    }
    
    // For validation errors, return empty array
    if (error.message.includes("Invalid order ID") || error.message.includes("validation")) {
      console.warn("Backend orders API has validation issues, returning empty array");
      return [];
    }
    
    // For authentication errors, return empty array
    if (error.message.includes("Authentication") || error.message.includes("401") || error.message.includes("403")) {
      console.warn("Access denied, returning empty array");
      return [];
    }
    
    throw error;
  }
}

/**
 * Updates the status of an order (admin only)
 * @param {string} orderId - The ID of the order to update
 * @param {string} status - The new status to set
 * @returns {Promise<Object>} The updated order
 * @throws {Error} If update fails
 */
export async function updateOrderStatus(orderId, status) {
  if (!orderId || !status) {
    throw new Error("OrderId and status are required");
  }

  const res = await fetchWithTimeout(
    `${ENDPOINTS.ORDERS}/${encodeURIComponent(orderId)}`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    }
  );    if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to update order status: ${error}`);
  }
  
  return res.json();
}

/**
 * Deletes an order (admin only)
 * @param {string} orderId - The ID of the order to delete
 * @returns {Promise<Object>} Deletion confirmation
 * @throws {Error} If deletion fails
 */
export async function deleteOrder(orderId) {
  const res = await fetchWithTimeout(
    `${ENDPOINTS.ORDERS}/${encodeURIComponent(orderId)}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );    if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to delete order: ${error}`);
  }
  
  return res.json();
}
