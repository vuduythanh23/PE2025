import { APP_INFO, API_CONFIG } from "../constants/api.js";

/**
 * Environment utility functions
 */
export const Environment = {
  /**
   * Check if app is running in development mode
   */
  isDevelopment: () => APP_INFO.ENVIRONMENT === 'development',

  /**
   * Check if app is running in production mode
   */
  isProduction: () => APP_INFO.ENVIRONMENT === 'production',

  /**
   * Check if app is running in staging mode
   */
  isStaging: () => APP_INFO.ENVIRONMENT === 'staging',

  /**
   * Get current environment name
   */
  getEnvironment: () => APP_INFO.ENVIRONMENT,

  /**
   * Check if debug mode is enabled
   */
  isDebugMode: () => API_CONFIG.DEBUG_MODE,

  /**
   * Check if logging is enabled
   */
  isLoggingEnabled: () => API_CONFIG.ENABLE_LOGGING,

  /**
   * Get app information
   */
  getAppInfo: () => ({
    name: APP_INFO.NAME,
    version: APP_INFO.VERSION,
    environment: APP_INFO.ENVIRONMENT,
    debugMode: API_CONFIG.DEBUG_MODE,
    loggingEnabled: API_CONFIG.ENABLE_LOGGING,
  }),

  /**
   * Get API configuration
   */
  getAPIConfig: () => ({
    baseUrl: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT_DURATION,
    retryAttempts: API_CONFIG.RETRY_ATTEMPTS,
    rateLimit: API_CONFIG.RATE_LIMIT,
  }),

  /**
   * Validate environment configuration
   */
  validateConfig: () => {
    const issues = [];

    if (!API_CONFIG.BASE_URL) {
      issues.push("API_CONFIG.BASE_URL is not configured");
    }

    if (!APP_INFO.NAME) {
      issues.push("APP_INFO.NAME is not configured");
    }

    if (API_CONFIG.TIMEOUT_DURATION <= 0) {
      issues.push("API_CONFIG.TIMEOUT_DURATION must be positive");
    }

    if (API_CONFIG.RETRY_ATTEMPTS < 0) {
      issues.push("API_CONFIG.RETRY_ATTEMPTS must be non-negative");
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  },
};
