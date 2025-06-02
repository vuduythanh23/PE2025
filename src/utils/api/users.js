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
export async function updateUser(id, updates) {
  const res = await fetch(`${ENDPOINTS.USERS}/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update user");
  return res.json();
}

/**
 * Updates a user as admin
 * @param {string} id - User ID
 * @param {Object} updates - User updates
 * @returns {Promise<Object>} Updated user data
 * @throws {Error} If update fails
 */
export async function adminUpdateUser(id, updates) {
  const res = await fetch(`${ENDPOINTS.USERS}/${id}/adminUpdateUser`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Failed to update user");
  }
  return res.json();
}

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
