/**
 * Admin Authentication Refresh Utility
 * This file provides functions to check and refresh admin authentication
 */

import { getCurrentUser } from "../api/users";
import { setAdmin, isAdmin } from "../storage/auth";

// Make sure these exports are properly defined

/**
 * Refresh admin status by checking with the server
 * @returns {Promise<boolean>} Whether the user is an admin
 */
export const refreshAdminStatus = async () => {
  try {
    console.log("Refreshing admin authentication status...");
    // First check if we already have admin status
    if (isAdmin()) {
      console.log("User already has admin status");
      return true;
    }

    // Otherwise, fetch the current user to verify admin status
    const userData = await getCurrentUser();
    console.log("Admin refresh - user data:", userData);

    // Check if the user has admin privileges
    const hasAdminPrivileges =
      userData &&
      (userData.isAdmin === true ||
        userData.role === "admin" ||
        userData.userType === "admin");

    if (hasAdminPrivileges) {
      console.log("Setting admin status to true based on user data");
      setAdmin();
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error refreshing admin status:", error);
    return false;
  }
};

/**
 * Check admin status and refresh if necessary
 * @param {boolean} force - Whether to force a refresh even if the user is already an admin
 * @returns {Promise<boolean>} Whether the user is an admin
 */
export const checkAndRefreshAdminStatus = async (force = false) => {
  // Check if we're in development mode with admin flag
  if (
    import.meta.env.DEV &&
    (window.location.search.includes("admin=true") ||
      import.meta.env.VITE_ALWAYS_ADMIN === "true")
  ) {
    console.log(
      "Development mode with admin flag detected - setting admin status"
    );
    setAdmin();
    return true;
  }

  // Check current admin status
  const currentAdminStatus = isAdmin();

  // If we're already an admin and not forcing a refresh, just return true
  if (currentAdminStatus && !force) {
    console.log("User already has admin status, no refresh needed");
    return true;
  }

  // Otherwise, refresh admin status
  return await refreshAdminStatus();
};
