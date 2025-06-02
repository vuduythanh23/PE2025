import { ENDPOINTS } from "../constants/api.js";
import { getAuthHeaders, fetchWithTimeout } from "./base.js";

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
  const res = await fetch(`${ENDPOINTS.USERS}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch users");
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
    const token = getToken(); // From your auth storage utility
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update user');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in updateUser:', error);
    throw error;
  }
};

// Admin-specific user update
export const adminUpdateUser = async (userId, userData) => {
  try {
    const token = getToken(); // From your auth storage utility
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update user');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in adminUpdateUser:', error);
    throw error;
  }
};

export const unlockUserAccount = (userId) => {
  // Implementation details
  return fetch(`/api/users/${userId}/unlock`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(response => response.json());
};

/**
 * Deletes a user account
 * @param {string} id - User ID to delete
 * @returns {Promise<Object>} Deletion confirmation
 * @throws {Error} If deletion fails
 */
export async function deleteUser(id) {
  const res = await fetchWithTimeout(`${ENDPOINTS.USERS}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to delete user: ${error}`);
  }
  return res.json();
}
