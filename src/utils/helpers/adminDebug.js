/**
 * Admin debugging utilities
 * This file contains utilities for debugging admin functionality
 * Only active in development mode
 */

import { getUser, setAdmin } from "../storage/auth";

/**
 * Enable admin mode for debugging
 * Only works in development mode
 */
export const enableAdminMode = () => {
  if (import.meta.env.DEV) {
    sessionStorage.setItem("isAdmin", "true");

    // Update URL with the admin query parameter if not already present
    if (!window.location.search.includes("admin=true")) {
      const url = new URL(window.location);
      url.searchParams.set("admin", "true");
      window.history.pushState({}, "", url);
    }

    return true;
  }
  return false;
};

/**
 * Check admin headers that would be sent
 */
export const checkAdminHeaders = async () => {
  if (!import.meta.env.DEV) return null;

  // Get current auth status
  const user = getUser();
  const isAdminInStorage = sessionStorage.getItem("isAdmin") === "true";
  const hasAdminRole =
    user &&
    (user.isAdmin === true ||
      user.role === "admin" ||
      user.userType === "admin");
  // Log current status

  // Create headers that would be sent
  const headers = {};
  if (isAdminInStorage || hasAdminRole) {
    headers["x-admin-auth"] = "true";
    headers["x-admin-role"] = "true";
    headers["x-admin-access"] = "true";
  }

  return {
    isAdmin: isAdminInStorage || hasAdminRole,
    user,
    headers,
  };
};

/**
 * Debug admin status and force enable if requested
 */
export const debugAdminStatus = (forceEnable = false) => {
  if (!import.meta.env.DEV) return;
  checkAdminHeaders();

  if (forceEnable) {
    setAdmin();
  }
};

// Run debug automatically in development
if (import.meta.env.DEV) {
  // Auto-enable admin if URL contains admin=true or env var is set
  if (
    window.location.search.includes("admin=true") ||
    import.meta.env.VITE_ALWAYS_ADMIN === "true"
  ) {
    enableAdminMode();
  }
}
