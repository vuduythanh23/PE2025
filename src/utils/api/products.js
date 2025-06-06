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

    // Check if we have a nested array structure (e.g. [[{product}], [{product}]])
    // This can happen in some API responses
    let processedData = data;
    if (data.length > 0 && Array.isArray(data[0])) {
      console.log("Detected nested array structure, flattening response");
      processedData = data.flat();
    }

    // Filter out null or undefined items
    processedData = processedData.filter((item) => item != null);

    console.log("After filtering nulls, products count:", processedData.length);

    // Additional detailed logging of the first product if available
    if (processedData.length > 0 && processedData[0]) {
      console.log("First product sample:", {
        id: processedData[0]._id || "no id",
        name: processedData[0].name || "no name",
        hasImages:
          Array.isArray(processedData[0].images) &&
          processedData[0].images.length > 0,
        imageUrl:
          Array.isArray(processedData[0].images) &&
          processedData[0].images.length > 0
            ? processedData[0].images[0]
            : "no image",
      });
    } else {
      console.log("No products returned in array or first product is null");
    }

    return processedData;
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
  const res = await fetchWithTimeout(
    `${ENDPOINTS.PRODUCTS}/${encodeURIComponent(id)}`,
    {
      headers: BASE_HEADERS,
    }
  );
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
  try {
    console.log("Creating product with data:", JSON.stringify(data, null, 2));
    const res = await fetch(`${ENDPOINTS.PRODUCTS}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Server error response:", errorText);
      throw new Error(`Failed to create product: ${res.status} ${errorText}`);
    }

    return res.json();
  } catch (error) {
    console.error("Error in createProduct:", error);
    throw error;
  }
}

/**
 * Update a product (admin only)
 * @param {string} id - Product ID
 * @param {Object} updates - Product updates
 * @returns {Promise<Object>} Updated product
 * @throws {Error} If update fails
 */
export async function updateProduct(id, updates) {
  try {
    console.log(`[API] Updating product with ID: ${id}`);
    console.log(`[API] Update payload:`, JSON.stringify(updates, null, 2));

    // Ensure ID is valid
    if (!id) {
      throw new Error("Invalid product ID");
    }

    // Endpoint construction
    const endpoint = `${ENDPOINTS.PRODUCTS}/${id}`;
    console.log(`[API] Sending request to: ${endpoint}`);

    // Get authorization headers
    const headers = getAuthHeaders();
    console.log("[API] Request headers:", headers);

    // Send request
    const res = await fetch(endpoint, {
      method: "PUT",
      headers: headers,
      body: JSON.stringify(updates),
    });

    // Log response status
    console.log(`[API] Response status: ${res.status} ${res.statusText}`);

    // Handle error responses
    if (!res.ok) {
      const errorText = await res.text();
      let parsedError;
      try {
        // Try to parse error as JSON
        parsedError = JSON.parse(errorText);
        console.error("[API] Server error response (JSON):", parsedError);
      } catch (e) {
        // If not JSON, use plain text
        console.error("[API] Server error response (text):", errorText);
      }

      // Create descriptive error message
      const errorMessage =
        parsedError?.message ||
        parsedError?.error ||
        `Request failed with status ${res.status}`;

      throw new Error(`Failed to update product: ${errorMessage}`);
    }

    // Parse successful response
    const data = await res.json();
    console.log("[API] Product updated successfully:", data);
    return data;
  } catch (error) {
    console.error("[API] Error in updateProduct:", error);
    throw error;
  }
}

/**
 * Delete a product (admin only)
 * @param {string} id - Product ID to delete
 * @returns {Promise<Object>} Deletion confirmation
 * @throws {Error} If deletion fails
 */
export async function deleteProduct(id) {
  const res = await fetchWithTimeout(
    `${ENDPOINTS.PRODUCTS}/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to delete product: ${error}`);
  }
  return res.json();
}
