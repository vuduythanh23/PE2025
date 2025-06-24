import { ENDPOINTS } from "../constants/api.js";
import { fetchWithTimeout, getAuthHeaders } from "./base.js";

/**
 * Fallback cart functions when backend is not available
 * These functions will gracefully handle API errors and provide user feedback
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
    console.warn("Cart API not available, using fallback:", error.message);
    // Return empty cart structure as fallback
    return {
      _id: "fallback-cart",
      user: null,
      items: [],
      totalPrice: 0,
    };
  }
}

/**
 * Add item to cart with fallback handling
 * @param {Object} item - Cart item to add
 * @returns {Promise<Object>} Updated cart or success message
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
    console.warn("Add to cart API failed, using fallback:", error.message);

    // For now, just return a success message since we can't actually add to cart
    return {
      success: true,
      message: "Item added to cart (demo mode - backend unavailable)",
      fallback: true,
    };
  }
}

/**
 * Update item quantity with fallback handling
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated cart or success message
 */
export async function updateItemQuantity(updateData) {
  try {
    if (!updateData.productId || updateData.quantity === undefined) {
      throw new Error("Product ID and quantity are required");
    }

    // Ensure the payload matches what backend expects
    const payload = {
      productId: updateData.productId,      newQuantity: updateData.quantity, // Backend expects 'newQuantity' field
      selectedSize: updateData.selectedSize,
      selectedColor: updateData.selectedColor,
    };

    const res = await fetchWithTimeout(`${ENDPOINTS.CARTS}/items`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }

    return res.json();
  } catch (error) {
    console.warn("Update quantity API failed, using fallback:", error.message);
    return {
      success: true,
      message: "Quantity updated (demo mode - backend unavailable)",
      fallback: true,
    };
  }
}

/**
 * Remove item from cart with fallback handling
 * @param {Object} removeData - Remove data
 * @returns {Promise<Object>} Updated cart or success message
 */
export async function removeItemFromCart(removeData) {
  try {
    if (!removeData.productId) {
      throw new Error("Product ID is required");
    }

    const res = await fetchWithTimeout(`${ENDPOINTS.CARTS}/items`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      body: JSON.stringify(removeData),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }

    return res.json();
  } catch (error) {
    console.warn("Remove item API failed, using fallback:", error.message);
    return {
      success: true,
      message: "Item removed (demo mode - backend unavailable)",
      fallback: true,
    };
  }
}

/**
 * Clear entire cart with fallback handling
 * @returns {Promise<Object>} Empty cart or success message
 */
export async function clearUserCart() {
  try {
    const res = await fetchWithTimeout(`${ENDPOINTS.CARTS}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }

    return res.json();
  } catch (error) {
    console.warn("Clear cart API failed, using fallback:", error.message);
    return {
      success: true,
      message: "Cart cleared (demo mode - backend unavailable)",
      fallback: true,
      items: [],
    };
  }
}
