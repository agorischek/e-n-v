import { COMMON_MESSAGES } from "./messages";

export const descriptions = {
  apiKey: "API key for external service",
  jwtSecret: "JWT secret key for token signing",
  jwtAccessTokenExpiresIn:
    "JWT access token expiration (e.g., '15m', '1h', '1d')",
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

export const traits = {
  apiKeyMin: "at least 8 characters long",
  jwtSecretMin: "at least 32 characters long for security",
  jwtDurationFormat: "in format like '15m', '1h', '7d'",
  mustBeValidUrl: COMMON_MESSAGES.MUST_BE_VALID_URL,
  httpProtocolRequired: "start with http:// or https://",
  httpsProtocolRequired: "webhook URLs should use HTTPS for security",
  encryptionKeyMin: "at least 32 characters long",
  sessionSecretMin:
    "at least 32 characters long for security",
  corsOriginInvalid: "'*' or comma-separated valid URLs",
  rateLimitRpmInt: "an integer",
  rateLimitRpmMin: "at least 1",
  rateLimitRpmMax: "not exceed 10,000",
  rateLimitWindowInt: "an integer",
  rateLimitWindowMin: "at least 1 minute",
  rateLimitWindowMax: "not exceed 60 minutes",
  apiTimeoutInt: "an integer",
  apiTimeoutMin: "at least 1 second",
  apiTimeoutMax: "not exceed 5 minutes",
  maxFileSizeInt: "an integer",
  maxFileSizeMin: "at least 1KB",
  maxFileSizeMax: "not exceed 1GB",
  portInt: "an integer",
  portMin: ">= 1024 (avoid reserved ports)",
  portMax: "<= 65535",
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

export const patterns = {
  jwtTokenDuration: /^\d+[smhd]$/,
  httpProtocol: /^https?:\/\//,
  httpsProtocol: /^https:\/\//,
} as const;
