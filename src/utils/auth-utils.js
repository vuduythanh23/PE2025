const TOKEN_KEY = "token";
const ADMIN_KEY = "isAdmin";

export const getToken = () => sessionStorage.getItem(TOKEN_KEY);
export const setToken = (token) => sessionStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => sessionStorage.removeItem(TOKEN_KEY);

export const isAdmin = () => sessionStorage.getItem(ADMIN_KEY) === "true";
export const setAdmin = () => sessionStorage.setItem(ADMIN_KEY, "true");
export const removeAdmin = () => sessionStorage.removeItem(ADMIN_KEY);

export const isAuthenticated = () => !!getToken();

export const logout = () => {
  removeToken();
  removeAdmin();
};
