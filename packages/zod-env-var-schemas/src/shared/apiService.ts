import { COMMON_MESSAGES } from "./messages";

export const API_SERVICE_DESCRIPTIONS = {
  API_KEY: "API key for external service",
  JWT_SECRET: "JWT secret key for token signing",
  JWT_ACCESS_TOKEN_EXPIRES_IN: "JWT access token expiration (e.g., '15m', '1h', '1d')",
  JWT_REFRESH_TOKEN_EXPIRES_IN: "JWT refresh token expiration (e.g., '7d', '30d')",
  API_BASE_URL: "Base URL for API service",
  SERVICE_URL: "Service URL",
  WEBHOOK_URL: "Webhook URL for receiving callbacks",
  OAUTH_CLIENT_ID: "OAuth client ID",
  OAUTH_CLIENT_SECRET: "OAuth client secret",
  OAUTH_REDIRECT_URI: "OAuth redirect URI",
  OAUTH_SCOPE: "OAuth scope (space-separated)",
  ENCRYPTION_KEY: "Encryption key for data encryption",
  SESSION_SECRET: "Session secret for cookie signing",
  CORS_ORIGIN: "CORS allowed origins (comma-separated URLs or '*')",
  RATE_LIMIT_RPM: "Rate limit: requests per minute",
  RATE_LIMIT_WINDOW: "Rate limit window size in minutes",
  API_TIMEOUT: "API request timeout (milliseconds)",
  MAX_FILE_SIZE: "Maximum file upload size (bytes)",
  LOG_LEVEL: "Application log level",
  NODE_ENV: "Node.js environment",
  PORT: "Server port number",
  HOST: "Server host address",
} as const;

export const API_SERVICE_MESSAGES = {
  API_KEY_MIN: "API key must be at least 8 characters long",
  JWT_SECRET_MIN: "JWT secret must be at least 32 characters long for security",
  JWT_DURATION_FORMAT: "Must be in format like '15m', '1h', '7d'",
  MUST_BE_VALID_URL: COMMON_MESSAGES.MUST_BE_VALID_URL,
  HTTP_PROTOCOL_REQUIRED: "Must start with http:// or https://",
  HTTPS_PROTOCOL_REQUIRED: "Webhook URLs should use HTTPS for security",
  OAUTH_CLIENT_ID_REQUIRED: "OAuth client ID is required",
  OAUTH_CLIENT_SECRET_MIN: "OAuth client secret must be at least 8 characters long",
  OAUTH_SCOPE_REQUIRED: "OAuth scope is required",
  ENCRYPTION_KEY_MIN: "Encryption key must be at least 32 characters long",
  SESSION_SECRET_MIN: "Session secret must be at least 32 characters long for security",
  CORS_ORIGIN_INVALID: "Must be '*' or comma-separated valid URLs",
  RATE_LIMIT_RPM_INT: "Rate limit must be an integer",
  RATE_LIMIT_RPM_MIN: "Rate limit must be at least 1",
  RATE_LIMIT_RPM_MAX: "Rate limit should not exceed 10,000",
  RATE_LIMIT_WINDOW_INT: "Rate limit window must be an integer",
  RATE_LIMIT_WINDOW_MIN: "Rate limit window must be at least 1 minute",
  RATE_LIMIT_WINDOW_MAX: "Rate limit window should not exceed 60 minutes",
  API_TIMEOUT_INT: "Timeout must be an integer",
  API_TIMEOUT_MIN: "Timeout must be at least 1 second",
  API_TIMEOUT_MAX: "Timeout should not exceed 5 minutes",
  MAX_FILE_SIZE_INT: "File size must be an integer",
  MAX_FILE_SIZE_MIN: "File size must be at least 1KB",
  MAX_FILE_SIZE_MAX: "File size should not exceed 1GB",
  PORT_INT: "Port must be an integer",
  PORT_MIN: "Port must be >= 1024 (avoid reserved ports)",
  PORT_MAX: "Port must be <= 65535",
} as const;

export const API_SERVICE_LENGTHS = {
  API_KEY_MIN: 8,
  JWT_SECRET_MIN: 32,
  OAUTH_CLIENT_SECRET_MIN: 8,
  ENCRYPTION_KEY_MIN: 32,
  SESSION_SECRET_MIN: 32,
} as const;

export const API_SERVICE_DEFAULTS = {
  JWT_ACCESS_TOKEN_EXPIRES_IN: "15m",
  JWT_REFRESH_TOKEN_EXPIRES_IN: "7d",
  RATE_LIMIT_RPM: 60,
  RATE_LIMIT_WINDOW: 1,
  API_TIMEOUT: 30000,
  MAX_FILE_SIZE: 10485760,
  LOG_LEVEL: "info",
  NODE_ENV: "development",
  PORT: 3000,
  HOST: "localhost",
} as const;

export const API_SERVICE_LIMITS = {
  RATE_LIMIT_RPM_MIN: 1,
  RATE_LIMIT_RPM_MAX: 10000,
  RATE_LIMIT_WINDOW_MIN: 1,
  RATE_LIMIT_WINDOW_MAX: 60,
  API_TIMEOUT_MIN: 1000,
  API_TIMEOUT_MAX: 300000,
  MAX_FILE_SIZE_MIN: 1024,
  MAX_FILE_SIZE_MAX: 1073741824,
  PORT_MIN: 1024,
  PORT_MAX: 65535,
} as const;

export const API_SERVICE_ENUM_OPTIONS = {
  LOG_LEVEL: ["error", "warn", "info", "debug", "trace"] as const,
  NODE_ENV: ["development", "production", "test", "staging"] as const,
} as const;
