import { ENDPOINTS, BASE_HEADERS } from "../constants/api.js";
import { rateLimiter, fetchWithRetry } from "./base.js";

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
    const res = await fetch(`${ENDPOINTS.USERS}/login`, {
      method: "POST",
      headers: {
        ...BASE_HEADERS,
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
      if (data.user.role === "admin") {
        sessionStorage.setItem("isAdmin", "true");
      }
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
