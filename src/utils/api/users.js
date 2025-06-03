import { ENDPOINTS, BASE_HEADERS } from "../constants/api.js";
import { getAuthHeaders, fetchWithTimeout } from "./base.js";
import { getToken } from "../storage/auth.js";

/**
 * Gets current user data
 * @returns {Promise<Object>} Current user data
 * @throws {Error} If fetching fails
 */
export async function getCurrentUser() {
  const res = await fetch(`${ENDPOINTS.USERS}/me`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch current user");
  return res.json();
}

/**
 * Gets all users (admin only)
 * @returns {Promise<Array>} Array of users
 * @throws {Error} If fetching fails
 */
export async function getAllUsers() {
  // Get standard auth headers
  const headers = getAuthHeaders();

  // Explicitly add admin headers to ensure admin access
  headers["x-admin-role"] = "true";
  headers["x-admin-auth"] = "true";
  headers["x-admin-access"] = "true";

  console.log("Fetching all users with headers:", headers);

  const res = await fetch(`${ENDPOINTS.USERS}`, {
    headers: headers,
  });

  if (!res.ok) {
    // Try to get the error message from the response
    let errorMessage = "Failed to fetch users";
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      console.error("Failed to parse error response:", e);
    }

    console.error("API error fetching users:", res.status, errorMessage);
    throw new Error(errorMessage);
  }

  return res.json();
}

/**
 * Gets a user by ID
 * @param {string} id - User ID
 * @returns {Promise<Object>} User data
 * @throws {Error} If fetching fails
 */
export async function getUserById(id) {
  const res = await fetch(`${ENDPOINTS.USERS}/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

/**
 * Updates a user
 * @param {string} id - User ID
 * @param {Object} updates - User updates
 * @returns {Promise<Object>} Updated user data
 * @throws {Error} If update fails
 */
// Regular user update (for user's own profile)
export const updateUser = async (userId, userData) => {
  try {
    const response = await fetch(`${ENDPOINTS.USERS}/${userId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update user");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in updateUser:", error);
    throw error;
  }
};

/**
 * Admin-specific user update
 * @param {string} userId - User ID to update
 * @param {Object} userData - Updated user data
 * @returns {Promise<Object>} Updated user data
 * @throws {Error} If update fails
 */
export const adminUpdateUser = async (userId, userData) => {
  try {
    // Perform validation on the client side
    if (userData.username && userData.username.length < 3) {
      throw new Error("Username must be at least 3 characters long");
    }

    if (
      userData.email &&
      !userData.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
    ) {
      throw new Error("Please provide a valid email address");
    }

    if (userData.password && userData.password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    // Get token directly from storage
    const token = sessionStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication required. Please log in again.");
    }    // Build headers with explicit admin role
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    const isUserAdmin = user?.isAdmin === true || user?.role === "admin";
    
    console.log("Current user admin status:", isUserAdmin, "User data:", user);
    
    // Force set admin status if needed
    if (isUserAdmin) {
      sessionStorage.setItem("isAdmin", "true");
    }
    
    const headers = {
      ...BASE_HEADERS,
      Authorization: `Bearer ${token}`,
      "x-admin-role": "true",
      "x-admin-auth": "true",
      "x-admin-access": "true", // Additional header for compatibility
    };
    
    console.log("Admin update headers:", headers);
    console.log("Updating user with data:", userData);    // For debugging, check what the current admin endpoint is
    const adminEndpoint = `${ENDPOINTS.USERS}/${userId}`;
    console.log("Using admin endpoint:", adminEndpoint);
    
    // Create a custom route object for reference
    const routes = {
      regular: `${ENDPOINTS.USERS}/${userId}`,
      admin: `${ENDPOINTS.USERS}/${userId}`
    };
    
    console.log("Available routes:", routes);
    
    // Use the admin-specific endpoint with proper route
    const response = await fetch(adminEndpoint, {
      method: "PATCH",
      headers: headers,
      body: JSON.stringify(userData),
    });

    console.log("Admin update response status:", response.status);

    if (!response.ok) {
      let errorMessage = "Failed to update user";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        console.error("Failed to parse error response:", e);
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Error in adminUpdateUser:", error);
    throw error;
  }
};

/**
 * Unlocks a user account
 * @param {string} userId - User ID to unlock
 * @returns {Promise<Object>} Updated user data
 * @throws {Error} If unlock operation fails
 */
export const unlockUserAccount = async (userId) => {
  try {
    // Get token directly from storage
    const token = sessionStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication required. Please log in again.");
    }

    // Build headers with explicit admin role
    const headers = {
      ...BASE_HEADERS,
      Authorization: `Bearer ${token}`,
      "x-admin-role": "true",
    };

    console.log("Admin unlock headers:", headers);

    const response = await fetch(`${ENDPOINTS.USERS}/${userId}/unlock`, {
      method: "POST",
      headers: headers,
    });

    console.log("Unlock response status:", response.status);

    if (!response.ok) {
      let errorMessage = "Failed to unlock user account";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        console.error("Failed to parse error response:", e);
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Error in unlockUserAccount:", error);
    throw error;
  }
};

/**
 * Deletes a user account (admin only)
 * @param {string} id - User ID to delete
 * @returns {Promise<Object>} Deletion confirmation
 * @throws {Error} If deletion fails
 */
export async function deleteUser(id) {
  // Get token directly from storage
  const token = sessionStorage.getItem("token");
  if (!token) {
    throw new Error("Authentication required. Please log in again.");
  }

  // Build headers with explicit admin role
  const headers = {
    ...BASE_HEADERS,
    Authorization: `Bearer ${token}`,
    "x-admin-role": "true",
  };

  console.log("Admin delete headers:", headers);

  const res = await fetchWithTimeout(
    `${ENDPOINTS.USERS}/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: headers,
    }
  );

  console.log("Delete response status:", res.status);

  if (!res.ok) {
    let errorMessage = "Failed to delete user";
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      const error = await res.text();
      errorMessage = error || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return res.json();
}
