// API Configuration Constants
export const API_CONFIG = {
  BASE_URL:
    import.meta.env.VITE_API_URL || "https://salty-crabs-read.loca.lt/api",
  TIMEOUT_DURATION: parseInt(import.meta.env.VITE_API_TIMEOUT) || 15000, // 15 seconds
  RETRY_ATTEMPTS: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS) || 3,
  RATE_LIMIT: {
    LIMIT: parseInt(import.meta.env.VITE_API_RATE_LIMIT) || 10, // requests
    INTERVAL: parseInt(import.meta.env.VITE_API_RATE_INTERVAL) || 1000, // 1 second
  },
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === "true",
  ENABLE_LOGGING: import.meta.env.VITE_ENABLE_LOGGING === "true",
};

// API Endpoints
export const ENDPOINTS = {
  USERS: `${API_CONFIG.BASE_URL}/users`,
  PRODUCTS: `${API_CONFIG.BASE_URL}/products`,
  BRANDS: `${API_CONFIG.BASE_URL}/brands`,
  CATEGORIES: `${API_CONFIG.BASE_URL}/categories`,
  ORDERS: `${API_CONFIG.BASE_URL}/orders`,
  UPLOAD: `${API_CONFIG.BASE_URL}/upload`,
};

// HTTP Headers
export const BASE_HEADERS = {
  "Content-Type": "application/json",
  "bypass-tunnel-reminder": "true",
};

// App Information
export const APP_INFO = {
  NAME: import.meta.env.VITE_APP_NAME || "ShoeShop",
  VERSION: import.meta.env.VITE_APP_VERSION || "1.0.0",
  ENVIRONMENT: import.meta.env.VITE_NODE_ENV || "development",
};

// Debug utilities
export const Logger = {
  log: (...args) => {
    if (API_CONFIG.ENABLE_LOGGING && API_CONFIG.DEBUG_MODE) {
      console.log(`[${APP_INFO.NAME}]`, ...args);
    }
  },
  error: (...args) => {
    if (API_CONFIG.ENABLE_LOGGING) {
      console.error(`[${APP_INFO.NAME}] ERROR:`, ...args);
    }
  },
  warn: (...args) => {
    if (API_CONFIG.ENABLE_LOGGING) {
      console.warn(`[${APP_INFO.NAME}] WARNING:`, ...args);
    }
  },
};
