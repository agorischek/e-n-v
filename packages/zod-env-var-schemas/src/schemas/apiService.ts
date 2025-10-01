import { z } from "zod";

/**
 * Generic API key with minimum length requirement
 */
export const API_KEY = z
  .string()
  .describe("API key for external service")
  .min(8, "API key must be at least 8 characters long");

/**
 * JWT secret key with strong requirements
 */
export const JWT_SECRET = z
  .string()
  .describe("JWT secret key for token signing")
  .min(32, "JWT secret must be at least 32 characters long for security");

/**
 * JWT access token expiration time
 */
export const JWT_ACCESS_TOKEN_EXPIRES_IN = z
  .string()
  .describe("JWT access token expiration (e.g., '15m', '1h', '1d')")
  .regex(/^\d+[smhd]$/, "Must be in format like '15m', '1h', '7d'")
  .default("15m");

/**
 * JWT refresh token expiration time
 */
export const JWT_REFRESH_TOKEN_EXPIRES_IN = z
  .string()
  .describe("JWT refresh token expiration (e.g., '7d', '30d')")
  .regex(/^\d+[smhd]$/, "Must be in format like '15m', '1h', '7d'")
  .default("7d");

/**
 * Base URL for API services
 */
export const API_BASE_URL = z
  .string()
  .describe("Base URL for API service")
  .url("Must be a valid URL")
  .regex(/^https?:\/\//, "Must start with http:// or https://");

/**
 * Service URL with HTTPS requirement for production
 */
export const SERVICE_URL = z
  .string()
  .describe("Service URL")
  .url("Must be a valid URL");

/**
 * Webhook URL for receiving callbacks
 */
export const WEBHOOK_URL = z
  .string()
  .describe("Webhook URL for receiving callbacks")
  .url("Must be a valid URL")
  .regex(/^https:\/\//, "Webhook URLs should use HTTPS for security");

/**
 * OAuth client ID
 */
export const OAUTH_CLIENT_ID = z
  .string()
  .describe("OAuth client ID")
  .min(1, "OAuth client ID is required");

/**
 * OAuth client secret
 */
export const OAUTH_CLIENT_SECRET = z
  .string()
  .describe("OAuth client secret")
  .min(8, "OAuth client secret must be at least 8 characters long");

/**
 * OAuth redirect URI
 */
export const OAUTH_REDIRECT_URI = z
  .string()
  .describe("OAuth redirect URI")
  .url("Must be a valid URL");

/**
 * OAuth scope
 */
export const OAUTH_SCOPE = z
  .string()
  .describe("OAuth scope (space-separated)")
  .min(1, "OAuth scope is required");

/**
 * Encryption key for data encryption
 */
export const ENCRYPTION_KEY = z
  .string()
  .describe("Encryption key for data encryption")
  .min(32, "Encryption key must be at least 32 characters long");

/**
 * Session secret for express-session or similar
 */
export const SESSION_SECRET = z
  .string()
  .describe("Session secret for cookie signing")
  .min(32, "Session secret must be at least 32 characters long for security");

/**
 * CORS allowed origins (comma-separated or single origin)
 */
export const CORS_ORIGIN = z
  .string()
  .describe("CORS allowed origins (comma-separated URLs or '*')")
  .refine(
    (val) => {
      if (val === "*") return true;
      const origins = val.split(",").map(s => s.trim());
      return origins.every(origin => {
        try {
          new URL(origin);
          return true;
        } catch {
          return false;
        }
      });
    },
    "Must be '*' or comma-separated valid URLs"
  );

/**
 * Rate limiting - requests per minute
 */
export const RATE_LIMIT_RPM = z
  .number()
  .describe("Rate limit: requests per minute")
  .int("Rate limit must be an integer")
  .min(1, "Rate limit must be at least 1")
  .max(10000, "Rate limit should not exceed 10,000")
  .default(60);

/**
 * Rate limiting - window size in minutes
 */
export const RATE_LIMIT_WINDOW = z
  .number()
  .describe("Rate limit window size in minutes")
  .int("Rate limit window must be an integer")
  .min(1, "Rate limit window must be at least 1 minute")
  .max(60, "Rate limit window should not exceed 60 minutes")
  .default(1);

/**
 * API timeout in milliseconds
 */
export const API_TIMEOUT = z
  .number()
  .describe("API request timeout (milliseconds)")
  .int("Timeout must be an integer")
  .min(1000, "Timeout must be at least 1 second")
  .max(300000, "Timeout should not exceed 5 minutes")
  .default(30000);

/**
 * Maximum file upload size in bytes
 */
export const MAX_FILE_SIZE = z
  .number()
  .describe("Maximum file upload size (bytes)")
  .int("File size must be an integer")
  .min(1024, "File size must be at least 1KB")
  .max(1073741824, "File size should not exceed 1GB")
  .default(10485760); // 10MB

/**
 * Log level for application logging
 */
export const LOG_LEVEL = z
  .enum(["error", "warn", "info", "debug", "trace"])
  .describe("Application log level")
  .default("info");

/**
 * Application environment
 */
export const NODE_ENV = z
  .enum(["development", "production", "test", "staging"])
  .describe("Node.js environment")
  .default("development");

/**
 * Server port number
 */
export const PORT = z
  .number()
  .describe("Server port number")
  .int("Port must be an integer")
  .min(1024, "Port must be >= 1024 (avoid reserved ports)")
  .max(65535, "Port must be <= 65535")
  .default(3000);

/**
 * Server host address
 */
export const HOST = z
  .string()
  .describe("Server host address")
  .default("localhost");

/**
 * Pre-configured API and service schemas for common scenarios
 */
export const apiServiceSchemas = {
  API_KEY,
  JWT_SECRET,
  JWT_ACCESS_TOKEN_EXPIRES_IN,
  JWT_REFRESH_TOKEN_EXPIRES_IN,
  API_BASE_URL,
  SERVICE_URL,
  WEBHOOK_URL,
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  OAUTH_REDIRECT_URI,
  OAUTH_SCOPE,
  ENCRYPTION_KEY,
  SESSION_SECRET,
  CORS_ORIGIN,
  RATE_LIMIT_RPM,
  RATE_LIMIT_WINDOW,
  API_TIMEOUT,
  MAX_FILE_SIZE,
  LOG_LEVEL,
  NODE_ENV,
  PORT,
  HOST,
};