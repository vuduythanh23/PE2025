import { ENDPOINTS, BASE_HEADERS } from "../constants/api.js";
import { rateLimiter, fetchWithTimeout, getAuthHeaders } from "./base.js";

/**
 * Add a rating to a product
 * @param {string} productId - Product ID
 * @param {number} rating - Rating value
 * @returns {Promise<Object>} Rating response
 * @throws {Error} If adding rating fails
 */
export async function addRating(productId, rating) {
  await rateLimiter.checkLimit("addRating");
  const res = await fetchWithTimeout(`${ENDPOINTS.PRODUCTS}/rating`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ productId, rating }),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to add rating: ${error}`);
  }
  return res.json();
}

/**
 * Get ratings for a product
 * @param {string} productId - Product ID
 * @returns {Promise<Array>} Array of ratings
 * @throws {Error} If fetching ratings fails
 */
export async function getRatingsByProduct(productId) {
  await rateLimiter.checkLimit("getRatings");
  const res = await fetchWithTimeout(
    `${ENDPOINTS.PRODUCTS}/ratings/${encodeURIComponent(productId)}`,
    {
      headers: BASE_HEADERS,
    }
  );
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch ratings: ${error}`);
  }
  return res.json();
}

/**
 * Add a comment to a product
 * @param {string} productId - Product ID
 * @param {string} comment - Comment text
 * @returns {Promise<Object>} Comment response
 * @throws {Error} If adding comment fails
 */
export async function addComment(productId, comment) {
  await rateLimiter.checkLimit("addComment");
  const res = await fetchWithTimeout(`${ENDPOINTS.PRODUCTS}/comment`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ productId, comment }),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to add comment: ${error}`);
  }
  return res.json();
}

/**
 * Get comments for a product
 * @param {string} productId - Product ID
 * @returns {Promise<Array>} Array of comments
 * @throws {Error} If fetching comments fails
 */
export async function getCommentsByProduct(productId) {
  await rateLimiter.checkLimit("getComments");
  const res = await fetchWithTimeout(
    `${ENDPOINTS.PRODUCTS}/comments/${encodeURIComponent(productId)}`,
    {
      headers: BASE_HEADERS,
    }
  );
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch comments: ${error}`);
  }
  return res.json();
}
