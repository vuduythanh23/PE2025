import { ENDPOINTS, BASE_HEADERS } from "../constants/api.js";
import { rateLimiter, fetchWithRetry } from "./base.js";

const LOCK_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Authenticates a user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} User data with auth token
 * @throws {Error} If authentication fails
 */
export async function loginUser(email, password) {  try {
    await rateLimiter.checkLimit("login");

    const res = await fetch(`${ENDPOINTS.USERS}/login`, {
      method: "POST",
      headers: {
        ...BASE_HEADERS,
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    });    let data;
    try {
      const responseText = await res.text();
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse response:", e);
      throw new Error("Server response was not in the expected format");
    }

    if (!res.ok) {
      if (res.status === 401) {
        if (data?.accountLocked) {
          if (data.unlockTime) {
            const remainingTime = Math.ceil(
              (new Date(data.unlockTime) - new Date()) / 60000
            );
            throw new Error(
              `Account is temporarily locked. Please try again in ${remainingTime} minutes.`
            );
          } else {
            throw new Error(
              "Account is locked. Please contact an administrator."
            );
          }
        } else if (data?.remainingAttempts >= 0) {
          throw new Error(
            `Invalid password. ${data.remainingAttempts} attempt${
              data.remainingAttempts !== 1 ? "s" : ""
            } remaining before account lockout.`
          );
        }
        throw new Error("Invalid email or password");
      }      console.error("Login error response:", data);
      throw new Error(data?.message || "Authentication failed");
    }

    if (data.token) {
      // Clear any existing session data first
      sessionStorage.clear();

      // Store new session data
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));      // Check for admin status in multiple fields to be safe
      if (data.user.role === "admin" || data.user.isAdmin === true) {
        sessionStorage.setItem("isAdmin", "true");
      } else {
        // User is not an admin
      }

      // Double-check that it was set correctly
    } else {
      throw new Error("No authentication token received");
    }

    return data;
  } catch (error) {
    console.error("Login error:", error);
    if (error.message === "Request timed out") {
      throw new Error(
        "Connection timed out. Please check your internet connection and try again."
      );
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
  const res = await fetchWithRetry(`${ENDPOINTS.USERS}/register`, {
    method: "POST",
    headers: BASE_HEADERS,
    body: JSON.stringify(formData),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Registration failed: ${error}`);
  }
  return res.json();
}

/**
 * Unlocks a locked user account (admin only)
 * @param {string} userId - ID of user to unlock
 * @returns {Promise<Object>} Updated user data
 * @throws {Error} If unlock fails
 */
export async function unlockUserAccount(userId) {
  const res = await fetch(`${ENDPOINTS.USERS}/${userId}/unlock`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to unlock account: ${error}`);
  }

  return res.json();
}
