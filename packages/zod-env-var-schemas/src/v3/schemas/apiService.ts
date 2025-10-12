import { z } from "zod";
import {
  HTTPS_PROTOCOL_PATTERN,
  HTTP_PROTOCOL_PATTERN,
  JWT_TOKEN_DURATION_PATTERN,
} from "../../shared/patterns";
import {
  defaults,
  descriptions,
  enumOptions,
  constraints,
  limits,
  messages,
} from "../../shared/apiService";
import {
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  OAUTH_REDIRECT_URI,
  OAUTH_SCOPE,
} from "./oauth";

/**
 * Generic API key with minimum length requirement
 */
export const API_KEY = z
  .string()
  .describe(descriptions.apiKey)
  .min(constraints.apiKeyMinLength, messages.apiKeyMin);

/**
 * JWT secret key with strong requirements
 */
export const JWT_SECRET = z
  .string()
  .describe(descriptions.jwtSecret)
  .min(constraints.jwtSecretMinLength, messages.jwtSecretMin);

/**
 * JWT access token expiration time
 */
export const JWT_ACCESS_TOKEN_EXPIRES_IN = z
  .string()
  .describe(descriptions.jwtAccessTokenExpiresIn)
  .regex(JWT_TOKEN_DURATION_PATTERN, messages.jwtDurationFormat)
  .default(defaults.jwtAccessTokenExpiresIn);

/**
 * JWT refresh token expiration time
 */
export const JWT_REFRESH_TOKEN_EXPIRES_IN = z
  .string()
  .describe(descriptions.jwtRefreshTokenExpiresIn)
  .regex(JWT_TOKEN_DURATION_PATTERN, messages.jwtDurationFormat)
  .default(defaults.jwtRefreshTokenExpiresIn);

/**
 * Base URL for API services
 */
export const API_BASE_URL = z
  .string()
  .describe(descriptions.apiBaseUrl)
  .url(messages.mustBeValidUrl)
  .regex(HTTP_PROTOCOL_PATTERN, messages.httpProtocolRequired);

/**
 * Service URL with HTTPS requirement for production
 */
export const SERVICE_URL = z
  .string()
  .describe(descriptions.serviceUrl)
  .url(messages.mustBeValidUrl);

/**
 * Webhook URL for receiving callbacks
 */
export const WEBHOOK_URL = z
  .string()
  .describe(descriptions.webhookUrl)
  .url(messages.mustBeValidUrl)
  .regex(HTTPS_PROTOCOL_PATTERN, messages.httpsProtocolRequired);

/**
 * Encryption key for data encryption
 */
export const ENCRYPTION_KEY = z
  .string()
  .describe(descriptions.encryptionKey)
  .min(constraints.encryptionKeyMinLength, messages.encryptionKeyMin);

/**
 * Session secret for express-session or similar
 */
export const SESSION_SECRET = z
  .string()
  .describe(descriptions.sessionSecret)
  .min(constraints.sessionSecretMinLength, messages.sessionSecretMin);

/**
 * CORS allowed origins (comma-separated or single origin)
 */
export const CORS_ORIGIN = z
  .string()
  .describe(descriptions.corsOrigin)
  .refine(
    (val) => {
      if (val === "*") return true;
      const origins = val.split(",").map(origin => origin.trim());
      return origins.every(origin => {
        try {
          new URL(origin);
          return true;
        } catch {
          return false;
        }
      });
    },
    messages.corsOriginInvalid
  );

/**
 * Rate limiting - requests per minute
 */
export const RATE_LIMIT_RPM = z
  .number()
  .describe(descriptions.rateLimitRpm)
  .int(messages.rateLimitRpmInt)
  .min(limits.rateLimitRpmMin, messages.rateLimitRpmMin)
  .max(limits.rateLimitRpmMax, messages.rateLimitRpmMax)
  .default(defaults.rateLimitRpm);

/**
 * Rate limiting - window size in minutes
 */
export const RATE_LIMIT_WINDOW = z
  .number()
  .describe(descriptions.rateLimitWindow)
  .int(messages.rateLimitWindowInt)
  .min(limits.rateLimitWindowMin, messages.rateLimitWindowMin)
  .max(limits.rateLimitWindowMax, messages.rateLimitWindowMax)
  .default(defaults.rateLimitWindow);

/**
 * API timeout in milliseconds
 */
export const API_TIMEOUT = z
  .number()
  .describe(descriptions.apiTimeout)
  .int(messages.apiTimeoutInt)
  .min(limits.apiTimeoutMin, messages.apiTimeoutMin)
  .max(limits.apiTimeoutMax, messages.apiTimeoutMax)
  .default(defaults.apiTimeout);

/**
 * Maximum file upload size in bytes
 */
export const MAX_FILE_SIZE = z
  .number()
  .describe(descriptions.maxFileSize)
  .int(messages.maxFileSizeInt)
  .min(limits.maxFileSizeMin, messages.maxFileSizeMin)
  .max(limits.maxFileSizeMax, messages.maxFileSizeMax)
  .default(defaults.maxFileSize);

/**
 * Log level for application logging
 */
export const LOG_LEVEL = z
  .enum([...enumOptions.logLevel])
  .describe(descriptions.logLevel)
  .default(defaults.logLevel);

/**
 * Application environment
 */
export const NODE_ENV = z
  .enum([...enumOptions.nodeEnv])
  .describe(descriptions.nodeEnv)
  .default(defaults.nodeEnv);

/**
 * Server port number
 */
export const PORT = z
  .number()
  .describe(descriptions.port)
  .int(messages.portInt)
  .min(limits.portMin, messages.portMin)
  .max(limits.portMax, messages.portMax)
  .default(defaults.port);

/**
 * Server host address
 */
export const HOST = z
  .string()
  .describe(descriptions.host)
  .default(defaults.host);

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
} as const;
