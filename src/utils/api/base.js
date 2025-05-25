import { API_CONFIG, BASE_HEADERS, Logger } from "../constants/api.js";

// Rate limiting utility
export const rateLimiter = {
  timestamps: {},
  limit: API_CONFIG.RATE_LIMIT.LIMIT,
  interval: API_CONFIG.RATE_LIMIT.INTERVAL,

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

// Timeout utility
export async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_DURATION);

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

// Base fetch utility with timeout and retry logic
export async function fetchWithRetry(url, options, retries = API_CONFIG.RETRY_ATTEMPTS) {
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
        lastError = errorJson.message || errorText;      } catch {
        lastError = errorText;
      }
      Logger.warn(`Request failed (attempt ${i + 1}/${retries}):`, lastError);

      // Don't retry if we got a valid error response
      if (response.status === 400 || response.status === 403) {
        throw new Error(lastError);
      }
    } catch (error) {
      if (error.message === "Invalid credentials") {
        throw error;
      }      lastError = error;
      Logger.warn(
        `Request error (attempt ${i + 1}/${retries}):`,
        error.message
      );
    }

    if (i < retries - 1) {
      const delay = Math.min(1000 * Math.pow(2, i), 5000); // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // If we have a structured error message, use it
  if (typeof lastError === "string") {
    throw new Error(lastError);
  }

  throw new Error("Unable to complete request. Please try again later.");
}

// Auth headers utility
export function getAuthHeaders() {
  const token = sessionStorage.getItem("token");
  if (!token) return BASE_HEADERS;

  try {
    // Basic token validation
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      console.warn("Token expired, clearing session");
      sessionStorage.removeItem("token");
      return BASE_HEADERS;
    }
  } catch (e) {
    console.warn("Invalid token format, clearing session");
    sessionStorage.removeItem("token");
    return BASE_HEADERS;
  }

  return { ...BASE_HEADERS, Authorization: `Bearer ${token}` };
}
