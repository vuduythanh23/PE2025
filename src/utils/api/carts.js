import { ENDPOINTS } from "../constants/api.js";
import { fetchWithTimeout, getAuthHeaders } from "./base.js";

/**
 * Cart API functions with fallback handling for when backend is unavailable
 */

/**
 * Get user's cart with fallback handling
 * @returns {Promise<Object>} Cart data with items
 * @throws {Error} If fetching fails
 */
export async function getUserCart() {
  try {
    const res = await fetchWithTimeout(`${ENDPOINTS.CARTS}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }

    return res.json();
  } catch (error) {
    console.warn('Cart API not available, using fallback:', error.message);
    // Return empty cart structure as fallback
    return {
      _id: 'fallback-cart',
      user: null,
      items: [],
      totalPrice: 0
    };
  }
}

/**
 * Add item to cart with fallback handling
 * @param {Object} item - Cart item to add
 * @param {string} item.productId - Product ID
 * @param {number} item.quantity - Quantity to add
 * @param {string} [item.selectedSize] - Selected size
 * @param {string} [item.selectedColor] - Selected color
 * @returns {Promise<Object>} Updated cart
 * @throws {Error} If addition fails
 */
export async function addItemToCart(item) {
  try {
    if (!item.productId || !item.quantity) {
      throw new Error("Product ID and quantity are required");
    }

    const res = await fetchWithTimeout(`${ENDPOINTS.CARTS}/items`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(item),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }

    return res.json();
  } catch (error) {
    console.warn('Add to cart API failed, using fallback:', error.message);
    
    // For demo purposes, return success but notify it's fallback mode
    throw new Error('Cart service temporarily unavailable. Please try again later.');
  }
}

/**
 * Update item quantity in cart
 * @param {Object} updateData - Update data
 * @param {string} updateData.productId - Product ID
 * @param {number} updateData.quantity - New quantity
 * @param {string} [updateData.selectedSize] - Selected size
 * @param {string} [updateData.selectedColor] - Selected color
 * @returns {Promise<Object>} Updated cart
 * @throws {Error} If update fails
 */
export async function updateItemQuantity(updateData) {
  if (!updateData.productId || updateData.quantity === undefined) {
    throw new Error("Product ID and quantity are required");
  }

  const res = await fetchWithTimeout(`${ENDPOINTS.CARTS}/items`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(updateData),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to update item quantity: ${error}`);
  }

  return res.json();
}

/**
 * Remove item from cart
 * @param {Object} removeData - Remove data
 * @param {string} removeData.productId - Product ID
 * @param {string} [removeData.selectedSize] - Selected size
 * @param {string} [removeData.selectedColor] - Selected color
 * @returns {Promise<Object>} Updated cart
 * @throws {Error} If removal fails
 */
export async function removeItemFromCart(removeData) {
  if (!removeData.productId) {
    throw new Error("Product ID is required");
  }

  const res = await fetchWithTimeout(`${ENDPOINTS.CARTS}/items`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    body: JSON.stringify(removeData),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to remove item from cart: ${error}`);
  }

  return res.json();
}

/**
 * Clear entire cart
 * @returns {Promise<Object>} Empty cart
 * @throws {Error} If clearing fails
 */
export async function clearUserCart() {
  const res = await fetchWithTimeout(`${ENDPOINTS.CARTS}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to clear cart: ${error}`);
  }

  return res.json();
}
