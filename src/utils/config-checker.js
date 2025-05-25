import { Environment } from "./helpers/environment.js";
import { Logger } from "./constants/api.js";

/**
 * Configuration Checker
 * Validates environment and configuration on app startup
 */
export class ConfigChecker {
  static async validate() {
    Logger.log("🔍 Validating application configuration...");

    const validation = Environment.validateConfig();
    const appInfo = Environment.getAppInfo();
    const apiConfig = Environment.getAPIConfig();

    // Log app information
    Logger.log("📱 App Information:", {
      name: appInfo.name,
      version: appInfo.version,
      environment: appInfo.environment,
    });

    // Log API configuration (without sensitive data)
    Logger.log("🌐 API Configuration:", {
      baseUrl: apiConfig.baseUrl,
      timeout: `${apiConfig.timeout}ms`,
      retryAttempts: apiConfig.retryAttempts,
      rateLimit: `${apiConfig.rateLimit.LIMIT} requests per ${apiConfig.rateLimit.INTERVAL}ms`,
    });

    // Check for configuration issues
    if (!validation.isValid) {
      Logger.error("❌ Configuration validation failed:");
      validation.issues.forEach((issue, index) => {
        Logger.error(`  ${index + 1}. ${issue}`);
      });

      if (Environment.isProduction()) {
        throw new Error("Invalid configuration detected in production environment");
      } else {
        Logger.warn("⚠️ Configuration issues detected. App may not function correctly.");
      }
    } else {
      Logger.log("✅ Configuration validation passed");
    }

    // Development-specific warnings
    if (Environment.isDevelopment()) {
      if (apiConfig.baseUrl.includes("localhost") || apiConfig.baseUrl.includes("loca.lt")) {
        Logger.warn("⚠️ Using development/tunnel API endpoint");
      }
    }

    // Production-specific checks
    if (Environment.isProduction()) {
      if (appInfo.debugMode) {
        Logger.warn("⚠️ Debug mode is enabled in production");
      }
      
      if (apiConfig.baseUrl.includes("localhost") || apiConfig.baseUrl.includes("loca.lt")) {
        Logger.error("❌ Using development API endpoint in production");
      }
    }

    Logger.log("🚀 Configuration check completed");
    return validation;
  }

  static getStatus() {
    return {
      environment: Environment.getEnvironment(),
      isValid: Environment.validateConfig().isValid,
      appInfo: Environment.getAppInfo(),
      timestamp: new Date().toISOString(),
    };
  }
}

// Auto-validate in development if logging is enabled
if (Environment.isDevelopment() && Environment.isLoggingEnabled()) {
  // Delay validation to ensure all modules are loaded
  setTimeout(() => {
    ConfigChecker.validate().catch((error) => {
      Logger.error("Configuration validation failed:", error);
    });
  }, 100);
}
