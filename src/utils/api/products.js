import { ENDPOINTS, BASE_HEADERS } from "../constants/api.js";
import { rateLimiter, fetchWithTimeout, getAuthHeaders } from "./base.js";

/**
 * Fetches products with optional filters
 * @param {Object} filters - Query parameters for filtering products
 * @returns {Promise<Array>} Array of products
 * @throws {Error} If fetching fails or response is invalid
 */
export async function getProducts(filters = {}) {
  try {
    console.log("Fetching products with filters:", filters);
    await rateLimiter.checkLimit("getProducts");
    const qp = new URLSearchParams(filters);
    const url = `${ENDPOINTS.PRODUCTS}?${qp}`;
    console.log("Request URL:", url);

    const res = await fetchWithTimeout(url, {
      headers: BASE_HEADERS,
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Server response error:", error);
      throw new Error(`Failed to fetch products: ${error}`);
    }

    const data = await res.json();
    console.log("Received products data:", data);

    if (!Array.isArray(data)) {
      console.error("Invalid data format:", data);
      throw new Error("Invalid response format: expected array of products");
    }

    return data;
  } catch (error) {
    console.error("Error in getProducts:", error);
    throw error;
  }
}

/**
 * Fetches a product by ID
 * @param {string} id - Product ID
 * @returns {Promise<Object>} Product data
 * @throws {Error} If fetching fails
 */
export async function getProductById(id) {
  const res = await fetchWithTimeout(`${ENDPOINTS.PRODUCTS}/${encodeURIComponent(id)}`, {
    headers: BASE_HEADERS,
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch product: ${error}`);
  }
  return res.json();
}

/**
 * Search products by query
 * @param {string} q - Search query
 * @returns {Promise<Array>} Search results
 * @throws {Error} If search fails
 */
export async function getProductsBySearch(q) {
  await rateLimiter.checkLimit("productSearch");
  const res = await fetchWithTimeout(
    `${ENDPOINTS.PRODUCTS}/search/suggestions?q=${encodeURIComponent(q)}`,
    {
      headers: BASE_HEADERS,
    }
  );
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Search failed: ${error}`);
  }
  return res.json();
}

/**
 * Get products by category
 * @param {string} categoryId - Category ID
 * @returns {Promise<Array>} Products in category
 * @throws {Error} If fetching fails
 */
export async function getProductsByCategory(categoryId) {
  await rateLimiter.checkLimit("productsByCategory");
  const res = await fetchWithTimeout(
    `${ENDPOINTS.PRODUCTS}/category/${encodeURIComponent(categoryId)}`,
    {
      headers: BASE_HEADERS,
    }
  );
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch by category: ${error}`);
  }
  return res.json();
}

/**
 * Get products by brand
 * @param {string} brandId - Brand ID
 * @returns {Promise<Array>} Products by brand
 * @throws {Error} If fetching fails
 */
export async function getProductsByBrand(brandId) {
  await rateLimiter.checkLimit("productsByBrand");
  const res = await fetchWithTimeout(
    `${ENDPOINTS.PRODUCTS}/brand/${encodeURIComponent(brandId)}`,
    {
      headers: BASE_HEADERS,
    }
  );
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch by brand: ${error}`);
  }
  return res.json();
}

/**
 * Get new arrivals
 * @returns {Promise<Array>} New arrival products
 * @throws {Error} If fetching fails
 */
export async function getNewArrivals() {
  await rateLimiter.checkLimit("newArrivals");
  const res = await fetchWithTimeout(`${ENDPOINTS.PRODUCTS}/new-arrivals`, {
    headers: BASE_HEADERS,
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch new arrivals: ${error}`);
  }
  return res.json();
}

/**
 * Get products on sale
 * @returns {Promise<Array>} Sale products
 * @throws {Error} If fetching fails
 */
export async function getOnSale() {
  await rateLimiter.checkLimit("onSale");
  const res = await fetchWithTimeout(`${ENDPOINTS.PRODUCTS}/on-sale`, {
    headers: BASE_HEADERS,
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch on-sale items: ${error}`);
  }
  return res.json();
}

/**
 * Get exclusive products
 * @returns {Promise<Array>} Exclusive products
 * @throws {Error} If fetching fails
 */
export async function getExclusive() {
  await rateLimiter.checkLimit("exclusive");
  const res = await fetchWithTimeout(`${ENDPOINTS.PRODUCTS}/exclusive`, {
    headers: BASE_HEADERS,
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch exclusive items: ${error}`);
  }
  return res.json();
}

/**
 * Get coming soon products
 * @returns {Promise<Array>} Coming soon products
 * @throws {Error} If fetching fails
 */
export async function getComingSoon() {
  const res = await fetch(`${ENDPOINTS.PRODUCTS}/coming-soon`, {
    headers: BASE_HEADERS,
  });
  if (!res.ok) throw new Error("Failed to fetch coming-soon items");
  return res.json();
}

/**
 * Create a new product (admin only)
 * @param {Object} data - Product data
 * @returns {Promise<Object>} Created product
 * @throws {Error} If creation fails
 */
export async function createProduct(data) {
  const res = await fetch(`${ENDPOINTS.PRODUCTS}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create product");
  return res.json();
}

/**
 * Update a product (admin only)
 * @param {string} id - Product ID
 * @param {Object} updates - Product updates
 * @returns {Promise<Object>} Updated product
 * @throws {Error} If update fails
 */
export async function updateProduct(id, updates) {
  const res = await fetch(`${ENDPOINTS.PRODUCTS}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update product");
  return res.json();
}

/**
 * Delete a product (admin only)
 * @param {string} id - Product ID to delete
 * @returns {Promise<Object>} Deletion confirmation
 * @throws {Error} If deletion fails
 */
export async function deleteProduct(id) {
  const res = await fetchWithTimeout(`${ENDPOINTS.PRODUCTS}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to delete product: ${error}`);
  }
  return res.json();
}
