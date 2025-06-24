// Storage keys
const TOKEN_KEY = "token";
const USER_KEY = "user";
const ADMIN_KEY = "isAdmin";

/**
 * Token management
 */
export const getToken = () => sessionStorage.getItem(TOKEN_KEY);

export const setToken = (token) => {
  sessionStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = () => {
  sessionStorage.removeItem(TOKEN_KEY);
};

/**
 * User data management
 */
export const getUser = () => {
  const user = sessionStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const setUser = (user) => {
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const removeUser = () => {
  sessionStorage.removeItem(USER_KEY);
};

/**
 * Admin status management
 */
export const isAdmin = () => {
  // First check session storage
  const adminStatus = sessionStorage.getItem(ADMIN_KEY) === "true";

  // Then check user object
  const user = getUser();

  // Check if user has admin privileges in the user object
  const hasAdminRole =
    user &&
    (user.isAdmin === true ||
      user.role === "admin" ||
      user.userType === "admin");

  // Make sure both storage and user object agree
  const isActuallyAdmin = adminStatus || hasAdminRole;

  // If there's a mismatch, fix it
  if (hasAdminRole && !adminStatus) {
    sessionStorage.setItem(ADMIN_KEY, "true");
  }

  // Force set admin status if running in development and admin flag is present
  if (import.meta.env.DEV && window.location.search.includes("admin=true")) {
    sessionStorage.setItem(ADMIN_KEY, "true");
    return true;
  }

  // Force set admin status if specified in environment variable (for testing)
  if (import.meta.env.VITE_ALWAYS_ADMIN === "true") {
    sessionStorage.setItem(ADMIN_KEY, "true");
    return true;
  }

  return isActuallyAdmin;
};

export const setAdmin = () => {
  sessionStorage.setItem(ADMIN_KEY, "true");
};

export const removeAdmin = () => {
  sessionStorage.removeItem(ADMIN_KEY);
};

/**
 * Authentication helpers
 */
export const isAuthenticated = () => !!getToken();

export const logout = () => {
  removeToken();
  removeUser();
  removeAdmin();
  // Clear any other session data
  sessionStorage.clear();
};
