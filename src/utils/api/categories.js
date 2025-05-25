import { ENDPOINTS, BASE_HEADERS } from "../constants/api.js";
import { rateLimiter, fetchWithTimeout, getAuthHeaders } from "./base.js";

/**
 * Fetches all categories
 * @returns {Promise<Array>} Array of categories
 * @throws {Error} If fetching fails
 */
export async function getCategories() {
  await rateLimiter.checkLimit("getCategories");
  const res = await fetchWithTimeout(ENDPOINTS.CATEGORIES, { headers: BASE_HEADERS });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch categories: ${error}`);
  }
  return res.json();
}

/**
 * Fetches a category by ID
 * @param {string} id - Category ID
 * @returns {Promise<Object>} Category data
 * @throws {Error} If fetching fails
 */
export async function getCategoryById(id) {
  await rateLimiter.checkLimit("getCategoryById");
  const res = await fetchWithTimeout(`${ENDPOINTS.CATEGORIES}/${encodeURIComponent(id)}`, {
    headers: BASE_HEADERS,
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch category: ${error}`);
  }
  return res.json();
}

/**
 * Creates a new category (admin only)
 * @param {Object} data - Category data
 * @returns {Promise<Object>} Created category
 * @throws {Error} If creation fails
 */
export async function createCategory(data) {
  await rateLimiter.checkLimit("createCategory");
  const res = await fetchWithTimeout(`${ENDPOINTS.CATEGORIES}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to create category: ${error}`);
  }
  return res.json();
}

/**
 * Updates a category (admin only)
 * @param {string} id - Category ID
 * @param {Object} updates - Category updates
 * @returns {Promise<Object>} Updated category
 * @throws {Error} If update fails
 */
export async function updateCategory(id, updates) {
  await rateLimiter.checkLimit("updateCategory");
  const res = await fetchWithTimeout(`${ENDPOINTS.CATEGORIES}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to update category: ${error}`);
  }
  return res.json();
}

/**
 * Deletes a category (admin only)
 * @param {string} id - Category ID
 * @returns {Promise<Object>} Deletion confirmation
 * @throws {Error} If deletion fails
 */
export async function deleteCategory(id) {
  await rateLimiter.checkLimit("deleteCategory");
  const res = await fetchWithTimeout(`${ENDPOINTS.CATEGORIES}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to delete category: ${error}`);
  }
  return res.json();
}
