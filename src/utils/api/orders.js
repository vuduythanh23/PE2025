import { ENDPOINTS } from "../constants/api.js";
import { fetchWithTimeout, getAuthHeaders } from "./base.js";

/**
 * Creates a new order
 * @param {Object} orderData - The order data
 * @returns {Promise<Object>} The created order
 * @throws {Error} If creation fails
 */
export async function createOrder(orderData) {
  const res = await fetchWithTimeout(`${ENDPOINTS.ORDERS}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(orderData),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to create order: ${error}`);
  }
  return res.json();
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
  );
  if (!res.ok) {
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
  const res = await fetchWithTimeout(`${ENDPOINTS.ORDERS}/my-orders`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch your orders: ${error}`);
  }
  return res.json();
}

/**
 * Fetches all orders (admin only)
 * @returns {Promise<Array>} Array of all orders
 * @throws {Error} If fetching fails
 */
export async function getAllOrders() {
  const res = await fetchWithTimeout(`${ENDPOINTS.ORDERS}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch all orders: ${error}`);
  }
  return res.json();
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
  );
  if (!res.ok) {
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
  );
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to delete order: ${error}`);
  }
  return res.json();
}
