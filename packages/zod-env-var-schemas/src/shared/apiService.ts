import { COMMON_MESSAGES } from "./messages";

export const descriptions = {
  apiKey: "API key for external service",
  jwtSecret: "JWT secret key for token signing",
  jwtAccessTokenExpiresIn: "JWT access token expiration (e.g., '15m', '1h', '1d')",
  jwtRefreshTokenExpiresIn: "JWT refresh token expiration (e.g., '7d', '30d')",
  apiBaseUrl: "Base URL for API service",
  serviceUrl: "Service URL",
  webhookUrl: "Webhook URL for receiving callbacks",
  encryptionKey: "Encryption key for data encryption",
  sessionSecret: "Session secret for cookie signing",
  corsOrigin: "CORS allowed origins (comma-separated URLs or '*')",
  rateLimitRpm: "Rate limit: requests per minute",
  rateLimitWindow: "Rate limit window size in minutes",
  apiTimeout: "API request timeout (milliseconds)",
  maxFileSize: "Maximum file upload size (bytes)",
  logLevel: "Application log level",
  nodeEnv: "Node.js environment",
  port: "Server port number",
  host: "Server host address",
} as const;

export const messages = {
  apiKeyMin: "API key must be at least 8 characters long",
  jwtSecretMin: "JWT secret must be at least 32 characters long for security",
  jwtDurationFormat: "Must be in format like '15m', '1h', '7d'",
  mustBeValidUrl: COMMON_MESSAGES.MUST_BE_VALID_URL,
  httpProtocolRequired: "Must start with http:// or https://",
  httpsProtocolRequired: "Webhook URLs should use HTTPS for security",
  encryptionKeyMin: "Encryption key must be at least 32 characters long",
  sessionSecretMin: "Session secret must be at least 32 characters long for security",
  corsOriginInvalid: "Must be '*' or comma-separated valid URLs",
  rateLimitRpmInt: "Rate limit must be an integer",
  rateLimitRpmMin: "Rate limit must be at least 1",
  rateLimitRpmMax: "Rate limit should not exceed 10,000",
  rateLimitWindowInt: "Rate limit window must be an integer",
  rateLimitWindowMin: "Rate limit window must be at least 1 minute",
  rateLimitWindowMax: "Rate limit window should not exceed 60 minutes",
  apiTimeoutInt: "Timeout must be an integer",
  apiTimeoutMin: "Timeout must be at least 1 second",
  apiTimeoutMax: "Timeout should not exceed 5 minutes",
  maxFileSizeInt: "File size must be an integer",
  maxFileSizeMin: "File size must be at least 1KB",
  maxFileSizeMax: "File size should not exceed 1GB",
  portInt: "Port must be an integer",
  portMin: "Port must be >= 1024 (avoid reserved ports)",
  portMax: "Port must be <= 65535",
} as const;

export const constraints = {
  apiKeyMinLength: 8,
  jwtSecretMinLength: 32,
  encryptionKeyMinLength: 32,
  sessionSecretMinLength: 32,
  rateLimitRpmMin: 1,
  rateLimitRpmMax: 10000,
  rateLimitWindowMin: 1,
  rateLimitWindowMax: 60,
  apiTimeoutMin: 1000,
  apiTimeoutMax: 300000,
  maxFileSizeMin: 1024,
  maxFileSizeMax: 1073741824,
  portMin: 1024,
  portMax: 65535,
} as const;

export const defaults = {
  jwtAccessTokenExpiresIn: "15m",
  jwtRefreshTokenExpiresIn: "7d",
  rateLimitRpm: 60,
  rateLimitWindow: 1,
  apiTimeout: 30000,
  maxFileSize: 10485760,
  logLevel: "info",
  nodeEnv: "development",
  port: 3000,
  host: "localhost",
} as const;

export const enumOptions = {
  logLevel: ["error", "warn", "info", "debug", "trace"] as const,
  nodeEnv: ["development", "production", "test", "staging"] as const,
} as const;
