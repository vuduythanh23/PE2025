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
export const isAdmin = () => sessionStorage.getItem(ADMIN_KEY) === "true";

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
