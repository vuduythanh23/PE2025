// API Configuration Constants
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "https://salty-crabs-read.loca.lt/api",
  TIMEOUT_DURATION: 15000, // 15 seconds
  RETRY_ATTEMPTS: 3,
  RATE_LIMIT: {
    LIMIT: 10, // requests
    INTERVAL: 1000, // 1 second
  },
};

// API Endpoints
export const ENDPOINTS = {
  USERS: `${API_CONFIG.BASE_URL}/users`,
  PRODUCTS: `${API_CONFIG.BASE_URL}/products`,
  BRANDS: `${API_CONFIG.BASE_URL}/brands`,
  CATEGORIES: `${API_CONFIG.BASE_URL}/categories`,
  ORDERS: `${API_CONFIG.BASE_URL}/orders`,
};

// HTTP Headers
export const BASE_HEADERS = {
  "Content-Type": "application/json",
  "bypass-tunnel-reminder": "true",
};
