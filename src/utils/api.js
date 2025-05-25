// src/utils/api.js

const API_URL =
  import.meta.env.VITE_API_URL || "https://salty-crabs-read.loca.lt/api";
const USERS_URL = `${API_URL}/users`;
const PRODS_URL = `${API_URL}/products`;
const BRANDS_URL = `${API_URL}/brands`;
const CATS_URL = `${API_URL}/categories`;
const ORDERS_URL = `${API_URL}/orders`;

const TIMEOUT_DURATION = 15000; // 15 seconds

const baseHeaders = {
  "Content-Type": "application/json",
  "bypass-tunnel-reminder": "true",
};

// Base fetch utility with timeout and retry logic
async function fetchWithRetry(url, options, retries = 3) {
    let lastError;
    let lastResponse;

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetchWithTimeout(url, options);
        lastResponse = response;
        
        if (!response.ok) {
          const error = await response.text();
          
          // Don't retry auth failures
          if (response.status === 401) {
            throw new Error("Invalid credentials");
          }
          
          // Handle server errors
          if (response.status >= 500) {
            throw new Error(`Server error: ${error}`);
          }
          
          throw new Error(error || `HTTP error! status: ${response.status}`);
        }
        
        if (response.ok) return response;

        const errorText = await response.text();
        try {
          // Try to parse as JSON for structured error messages
          const errorJson = JSON.parse(errorText);
          lastError = errorJson.message || errorText;
        } catch {
          lastError = errorText;
        }
        console.warn(`Request failed (attempt ${i + 1}/${retries}):`, lastError);
        
        // Don't retry if we got a valid error response
        if (response.status === 400 || response.status === 403) {
          throw new Error(lastError);
        }
      } catch (error) {
        if (error.message === "Invalid credentials") {
          throw error;
        }
        lastError = error;
        console.warn(`Request error (attempt ${i + 1}/${retries}):`, error.message);
      }

      if (i < retries - 1) {
        const delay = Math.min(1000 * Math.pow(2, i), 5000); // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // If we have a structured error message, use it
    if (typeof lastError === 'string') {
      throw new Error(lastError);
    }
    
    throw new Error("Unable to complete request. Please try again later.");
}

// Auth headers utility
function getAuthHeaders() {
  const token = sessionStorage.getItem("token");
  if (!token) return baseHeaders;

  try {
    // Basic token validation
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      console.warn("Token expired, clearing session");
      sessionStorage.removeItem("token");
      return baseHeaders;
    }
  } catch (e) {
    console.warn("Invalid token format, clearing session");
    sessionStorage.removeItem("token");
    return baseHeaders;
  }

  return { ...baseHeaders, Authorization: `Bearer ${token}` };
}

// Timeout utility
async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_DURATION);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === "AbortError") {
      throw new Error("Request timed out");
    }
    throw error;
  }
}

// Rate limiting utility
const rateLimiter = {
  timestamps: {},
  limit: 10, // requests
  interval: 1000, // 1 second

  async checkLimit(endpoint) {
    const now = Date.now();
    const timestamps = this.timestamps[endpoint] || [];
    const validTimestamps = timestamps.filter((t) => now - t < this.interval);
    this.timestamps[endpoint] = validTimestamps;

    if (validTimestamps.length >= this.limit) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }

    this.timestamps[endpoint] = [...validTimestamps, now];
  },
};

/**
 * ─── AUTH & USER ────────────────────────────────────────────────────────────
 */

/**
 * Authenticates a user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} User data with auth token
 * @throws {Error} If authentication fails
 */
export async function loginUser(email, password) {
  try {
    await rateLimiter.checkLimit("login");

    console.log("Attempting login with:", { email });
    const res = await fetch(`${USERS_URL}/login`, {
      method: "POST",
      headers: {
        ...baseHeaders,
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    let data;
    try {
      const responseText = await res.text();
      console.log("Response status:", res.status);
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse response:", e);
      throw new Error("Server response was not in the expected format");
    }

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error("Invalid email or password");
      }
      console.error("Login error response:", data);
      throw new Error(data?.message || "Authentication failed");
    }

    console.log("Login successful, data:", data);
    if (data.token) {
      // Clear any existing session data first
      sessionStorage.clear();
      
      // Store new session data
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));
      if (data.user.role === 'admin') {
        sessionStorage.setItem("isAdmin", "true");
      }
    } else {
      throw new Error("No authentication token received");
    }

    return data;
  } catch (error) {
    console.error("Login error:", error);
    if (error.message === "Request timed out") {
      throw new Error("Connection timed out. Please check your internet connection and try again.");
    }
    throw error;
  }
}

/**
 * Registers a new user
 * @param {Object} formData - User registration data
 * @returns {Promise<Object>} Created user data
 * @throws {Error} If registration fails
 */
export async function registerUser(formData) {
  await rateLimiter.checkLimit("register");
  const res = await fetchWithRetry(`${USERS_URL}/register`, {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify(formData),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Registration failed: ${error}`);
  }
  return res.json();
}

export async function getCurrentUser() {
  const res = await fetch(`${USERS_URL}/me`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch current user");
  return res.json();
}

export async function getAllUsers() {
  const res = await fetch(`${USERS_URL}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function getUserById(id) {
  const res = await fetch(`${USERS_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

export async function updateUser(id, updates) {
  const res = await fetch(`${USERS_URL}/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update user");
  return res.json();
}

/**
 * Deletes a user account
 * @param {string} id - User ID to delete
 * @returns {Promise<Object>} Deletion confirmation
 * @throws {Error} If deletion fails
 */
export async function deleteUser(id) {
  const res = await fetchWithTimeout(`${USERS_URL}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to delete user: ${error}`);
  }
  return res.json();
}

/**
 * ─── PRODUCTS ────────────────────────────────────────────────────────────────
 */

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
    const url = `${PRODS_URL}?${qp}`;
    console.log("Request URL:", url);

    const res = await fetchWithTimeout(url, {
      headers: baseHeaders,
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
  const res = await fetchWithTimeout(`${PRODS_URL}/${encodeURIComponent(id)}`, {
    headers: baseHeaders,
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch product: ${error}`);
  }
  return res.json();
}

export async function getProductsBySearch(q) {
  await rateLimiter.checkLimit("productSearch");
  const res = await fetchWithTimeout(
    `${PRODS_URL}/search/suggestions?q=${encodeURIComponent(q)}`,
    {
      headers: baseHeaders,
    }
  );
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Search failed: ${error}`);
  }
  return res.json();
}

export async function getProductsByCategory(categoryId) {
  await rateLimiter.checkLimit("productsByCategory");
  const res = await fetchWithTimeout(
    `${PRODS_URL}/category/${encodeURIComponent(categoryId)}`,
    {
      headers: baseHeaders,
    }
  );
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch by category: ${error}`);
  }
  return res.json();
}

export async function getProductsByBrand(brandId) {
  await rateLimiter.checkLimit("productsByBrand");
  const res = await fetchWithTimeout(
    `${PRODS_URL}/brand/${encodeURIComponent(brandId)}`,
    {
      headers: baseHeaders,
    }
  );
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch by brand: ${error}`);
  }
  return res.json();
}

export async function getNewArrivals() {
  await rateLimiter.checkLimit("newArrivals");
  const res = await fetchWithTimeout(`${PRODS_URL}/new-arrivals`, {
    headers: baseHeaders,
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch new arrivals: ${error}`);
  }
  return res.json();
}

export async function getOnSale() {
  await rateLimiter.checkLimit("onSale");
  const res = await fetchWithTimeout(`${PRODS_URL}/on-sale`, {
    headers: baseHeaders,
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch on-sale items: ${error}`);
  }
  return res.json();
}

export async function getExclusive() {
  await rateLimiter.checkLimit("exclusive");
  const res = await fetchWithTimeout(`${PRODS_URL}/exclusive`, {
    headers: baseHeaders,
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch exclusive items: ${error}`);
  }
  return res.json();
}

export async function getComingSoon() {
  const res = await fetch(`${PRODS_URL}/coming-soon`, {
    headers: baseHeaders,
  });
  if (!res.ok) throw new Error("Failed to fetch coming-soon items");
  return res.json();
}

export async function createProduct(data) {
  const res = await fetch(`${PRODS_URL}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create product");
  return res.json();
}

export async function updateProduct(id, updates) {
  const res = await fetch(`${PRODS_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update product");
  return res.json();
}

/**
 * Deletes a product
 * @param {string} id - Product ID to delete
 * @returns {Promise<Object>} Deletion confirmation
 * @throws {Error} If deletion fails
 */
export async function deleteProduct(id) {
  const res = await fetchWithTimeout(`${PRODS_URL}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to delete product: ${error}`);
  }
  return res.json();
}

/**
 * ─── BRANDS & CATEGORIES ────────────────────────────────────────────────────
 */

/**
 * Fetches all brands
 * @returns {Promise<Array>} Array of brands
 * @throws {Error} If fetching fails
 */
export async function getBrands() {
  await rateLimiter.checkLimit("getBrands");
  const res = await fetchWithTimeout(BRANDS_URL, { headers: baseHeaders });
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
    `${BRANDS_URL}/${encodeURIComponent(id)}`,
    {
      headers: baseHeaders,
    }
  );
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch brand: ${error}`);
  }
  return res.json();
}

/**
 * Creates a new brand
 * @param {Object} data - Brand data
 * @returns {Promise<Object>} Created brand
 * @throws {Error} If creation fails
 */
export async function createBrand(data) {
  await rateLimiter.checkLimit("createBrand");
  const res = await fetchWithTimeout(`${BRANDS_URL}`, {
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
 * Updates a brand
 * @param {string} id - Brand ID
 * @param {Object} updates - Brand updates
 * @returns {Promise<Object>} Updated brand
 * @throws {Error} If update fails
 */
export async function updateBrand(id, updates) {
  await rateLimiter.checkLimit("updateBrand");
  const res = await fetchWithTimeout(
    `${BRANDS_URL}/${encodeURIComponent(id)}`,
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
 * Deletes a brand
 * @param {string} id - Brand ID
 * @returns {Promise<Object>} Deletion confirmation
 * @throws {Error} If deletion fails
 */
export async function deleteBrand(id) {
  await rateLimiter.checkLimit("deleteBrand");
  const res = await fetchWithTimeout(
    `${BRANDS_URL}/${encodeURIComponent(id)}`,
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

/**
 * Fetches all categories
 * @returns {Promise<Array>} Array of categories
 * @throws {Error} If fetching fails
 */
export async function getCategories() {
  await rateLimiter.checkLimit("getCategories");
  const res = await fetchWithTimeout(CATS_URL, { headers: baseHeaders });
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
  const res = await fetchWithTimeout(`${CATS_URL}/${encodeURIComponent(id)}`, {
    headers: baseHeaders,
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch category: ${error}`);
  }
  return res.json();
}

/**
 * Creates a new category
 * @param {Object} data - Category data
 * @returns {Promise<Object>} Created category
 * @throws {Error} If creation fails
 */
export async function createCategory(data) {
  await rateLimiter.checkLimit("createCategory");
  const res = await fetchWithTimeout(`${CATS_URL}`, {
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
 * Updates a category
 * @param {string} id - Category ID
 * @param {Object} updates - Category updates
 * @returns {Promise<Object>} Updated category
 * @throws {Error} If update fails
 */
export async function updateCategory(id, updates) {
  await rateLimiter.checkLimit("updateCategory");
  const res = await fetchWithTimeout(`${CATS_URL}/${encodeURIComponent(id)}`, {
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
 * Deletes a category
 * @param {string} id - Category ID
 * @returns {Promise<Object>} Deletion confirmation
 * @throws {Error} If deletion fails
 */
export async function deleteCategory(id) {
  await rateLimiter.checkLimit("deleteCategory");
  const res = await fetchWithTimeout(`${CATS_URL}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to delete category: ${error}`);
  }
  return res.json();
}

/**
 * ─── RATINGS & COMMENTS ─────────────────────────────────────────────────────
 */
export async function addRating(productId, rating) {
  await rateLimiter.checkLimit("addRating");
  const res = await fetchWithTimeout(`${PRODS_URL}/rating`, {
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

export async function getRatingsByProduct(productId) {
  await rateLimiter.checkLimit("getRatings");
  const res = await fetchWithTimeout(
    `${PRODS_URL}/ratings/${encodeURIComponent(productId)}`,
    {
      headers: baseHeaders,
    }
  );
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch ratings: ${error}`);
  }
  return res.json();
}

export async function addComment(productId, comment) {
  await rateLimiter.checkLimit("addComment");
  const res = await fetchWithTimeout(`${PRODS_URL}/comment`, {
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

export async function getCommentsByProduct(productId) {
  await rateLimiter.checkLimit("getComments");
  const res = await fetchWithTimeout(
    `${PRODS_URL}/comments/${encodeURIComponent(productId)}`,
    {
      headers: baseHeaders,
    }
  );
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch comments: ${error}`);
  }
  return res.json();
}

/**
 * ─── ORDERS ─────────────────────────────────────────────────────────────────
 */

/**
 * Creates a new order
 * @param {Object} orderData - The order data
 * @returns {Promise<Object>} The created order
 * @throws {Error} If creation fails
 */
export async function createOrder(orderData) {
  const res = await fetchWithTimeout(`${ORDERS_URL}`, {
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
    `${ORDERS_URL}/${encodeURIComponent(orderId)}`,
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
  const res = await fetchWithTimeout(`${ORDERS_URL}/my-orders`, {
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
  const res = await fetchWithTimeout(`${ORDERS_URL}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch all orders: ${error}`);
  }
  return res.json();
}

/**
 * Deletes an order
 * @param {string} orderId - The ID of the order to delete
 * @returns {Promise<Object>} Deletion confirmation
 * @throws {Error} If deletion fails
 */
export async function deleteOrder(orderId) {
  const res = await fetchWithTimeout(
    `${ORDERS_URL}/${encodeURIComponent(orderId)}`,
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

/**
 * Updates the status of an order
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
    `${ORDERS_URL}/${encodeURIComponent(orderId)}`,
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
