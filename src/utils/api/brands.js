import { ENDPOINTS, BASE_HEADERS } from "../constants/api.js";
import { rateLimiter, fetchWithTimeout, getAuthHeaders } from "./base.js";

/**
 * Fetches all brands
 * @returns {Promise<Array>} Array of brands
 * @throws {Error} If fetching fails
 */
export async function getBrands() {
  await rateLimiter.checkLimit("getBrands");
  const res = await fetchWithTimeout(ENDPOINTS.BRANDS, { headers: BASE_HEADERS });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch brands: ${error}`);
  }
  return res.json();
}

/**
 * Fetches a brand by ID
 * @param {string} id - Brand ID
 * @returns {Promise<Object>} Brand data
 * @throws {Error} If fetching fails
 */
export async function getBrandById(id) {
  await rateLimiter.checkLimit("getBrandById");
  const res = await fetchWithTimeout(
    `${ENDPOINTS.BRANDS}/${encodeURIComponent(id)}`,
    {
      headers: BASE_HEADERS,
    }
  );
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch brand: ${error}`);
  }
  return res.json();
}

/**
 * Creates a new brand (admin only)
 * @param {Object} data - Brand data
 * @returns {Promise<Object>} Created brand
 * @throws {Error} If creation fails
 */
export async function createBrand(data) {
  await rateLimiter.checkLimit("createBrand");
  const res = await fetchWithTimeout(`${ENDPOINTS.BRANDS}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to create brand: ${error}`);
  }
  return res.json();
}

/**
 * Updates a brand (admin only)
 * @param {string} id - Brand ID
 * @param {Object} updates - Brand updates
 * @returns {Promise<Object>} Updated brand
 * @throws {Error} If update fails
 */
export async function updateBrand(id, updates) {
  await rateLimiter.checkLimit("updateBrand");
  const res = await fetchWithTimeout(
    `${ENDPOINTS.BRANDS}/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    }
  );
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to update brand: ${error}`);
  }
  return res.json();
}

/**
 * Deletes a brand (admin only)
 * @param {string} id - Brand ID
 * @returns {Promise<Object>} Deletion confirmation
 * @throws {Error} If deletion fails
 */
export async function deleteBrand(id) {
  await rateLimiter.checkLimit("deleteBrand");
  const res = await fetchWithTimeout(
    `${ENDPOINTS.BRANDS}/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to delete brand: ${error}`);
  }
  return res.json();
}
