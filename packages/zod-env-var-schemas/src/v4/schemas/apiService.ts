import { z } from "zod";
import {
  HTTPS_PROTOCOL_PATTERN,
  HTTP_PROTOCOL_PATTERN,
  JWT_TOKEN_DURATION_PATTERN,
} from "../../shared/patterns";
import {
  API_SERVICE_DEFAULTS,
  API_SERVICE_DESCRIPTIONS,
  API_SERVICE_ENUM_OPTIONS,
  API_SERVICE_LENGTHS,
  API_SERVICE_LIMITS,
  API_SERVICE_MESSAGES,
} from "../../shared/apiService";

/**
 * Generic API key with minimum length requirement
 */
export const API_KEY = z
  .string()
  .describe(API_SERVICE_DESCRIPTIONS.API_KEY)
  .min(API_SERVICE_LENGTHS.API_KEY_MIN, { error: API_SERVICE_MESSAGES.API_KEY_MIN });

/**
 * JWT secret key with strong requirements
 */
export const JWT_SECRET = z
  .string()
  .describe(API_SERVICE_DESCRIPTIONS.JWT_SECRET)
  .min(API_SERVICE_LENGTHS.JWT_SECRET_MIN, { error: API_SERVICE_MESSAGES.JWT_SECRET_MIN });

/**
 * JWT access token expiration time
 */
export const JWT_ACCESS_TOKEN_EXPIRES_IN = z
  .string()
  .describe(API_SERVICE_DESCRIPTIONS.JWT_ACCESS_TOKEN_EXPIRES_IN)
  .regex(JWT_TOKEN_DURATION_PATTERN, { error: API_SERVICE_MESSAGES.JWT_DURATION_FORMAT })
  .default(API_SERVICE_DEFAULTS.JWT_ACCESS_TOKEN_EXPIRES_IN);

/**
 * JWT refresh token expiration time
 */
export const JWT_REFRESH_TOKEN_EXPIRES_IN = z
  .string()
  .describe(API_SERVICE_DESCRIPTIONS.JWT_REFRESH_TOKEN_EXPIRES_IN)
  .regex(JWT_TOKEN_DURATION_PATTERN, { error: API_SERVICE_MESSAGES.JWT_DURATION_FORMAT })
  .default(API_SERVICE_DEFAULTS.JWT_REFRESH_TOKEN_EXPIRES_IN);

/**
 * Base URL for API services
 */
export const API_BASE_URL = z
  .string()
  .describe(API_SERVICE_DESCRIPTIONS.API_BASE_URL)
  .url({ error: API_SERVICE_MESSAGES.MUST_BE_VALID_URL })
  .regex(HTTP_PROTOCOL_PATTERN, { error: API_SERVICE_MESSAGES.HTTP_PROTOCOL_REQUIRED });

/**
 * Service URL with HTTPS requirement for production
 */
export const SERVICE_URL = z
  .string()
  .describe(API_SERVICE_DESCRIPTIONS.SERVICE_URL)
  .url({ error: API_SERVICE_MESSAGES.MUST_BE_VALID_URL });

/**
 * Webhook URL for receiving callbacks
 */
export const WEBHOOK_URL = z
  .string()
  .describe(API_SERVICE_DESCRIPTIONS.WEBHOOK_URL)
  .url({ error: API_SERVICE_MESSAGES.MUST_BE_VALID_URL })
  .regex(HTTPS_PROTOCOL_PATTERN, { error: API_SERVICE_MESSAGES.HTTPS_PROTOCOL_REQUIRED });

/**
 * OAuth client ID
 */
export const OAUTH_CLIENT_ID = z
  .string()
  .describe(API_SERVICE_DESCRIPTIONS.OAUTH_CLIENT_ID)
  .min(1, { error: API_SERVICE_MESSAGES.OAUTH_CLIENT_ID_REQUIRED });

/**
 * OAuth client secret
 */
export const OAUTH_CLIENT_SECRET = z
  .string()
  .describe(API_SERVICE_DESCRIPTIONS.OAUTH_CLIENT_SECRET)
  .min(API_SERVICE_LENGTHS.OAUTH_CLIENT_SECRET_MIN, { error: API_SERVICE_MESSAGES.OAUTH_CLIENT_SECRET_MIN });

/**
 * OAuth redirect URI
 */
export const OAUTH_REDIRECT_URI = z
  .string()
  .describe(API_SERVICE_DESCRIPTIONS.OAUTH_REDIRECT_URI)
  .url({ error: API_SERVICE_MESSAGES.MUST_BE_VALID_URL });

/**
 * OAuth scope
 */
export const OAUTH_SCOPE = z
  .string()
  .describe(API_SERVICE_DESCRIPTIONS.OAUTH_SCOPE)
  .min(1, { error: API_SERVICE_MESSAGES.OAUTH_SCOPE_REQUIRED });

/**
 * Encryption key for data encryption
 */
export const ENCRYPTION_KEY = z
  .string()
  .describe(API_SERVICE_DESCRIPTIONS.ENCRYPTION_KEY)
  .min(API_SERVICE_LENGTHS.ENCRYPTION_KEY_MIN, { error: API_SERVICE_MESSAGES.ENCRYPTION_KEY_MIN });

/**
 * Session secret for express-session or similar
 */
export const SESSION_SECRET = z
  .string()
  .describe(API_SERVICE_DESCRIPTIONS.SESSION_SECRET)
  .min(API_SERVICE_LENGTHS.SESSION_SECRET_MIN, { error: API_SERVICE_MESSAGES.SESSION_SECRET_MIN });

/**
 * CORS allowed origins (comma-separated or single origin)
 */
export const CORS_ORIGIN = z
  .string()
  .describe(API_SERVICE_DESCRIPTIONS.CORS_ORIGIN)
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
    { error: API_SERVICE_MESSAGES.CORS_ORIGIN_INVALID }
  );

/**
 * Rate limiting - requests per minute
 */
export const RATE_LIMIT_RPM = z
  .number()
  .describe(API_SERVICE_DESCRIPTIONS.RATE_LIMIT_RPM)
  .int({ error: API_SERVICE_MESSAGES.RATE_LIMIT_RPM_INT })
  .min(API_SERVICE_LIMITS.RATE_LIMIT_RPM_MIN, { error: API_SERVICE_MESSAGES.RATE_LIMIT_RPM_MIN })
  .max(API_SERVICE_LIMITS.RATE_LIMIT_RPM_MAX, { error: API_SERVICE_MESSAGES.RATE_LIMIT_RPM_MAX })
  .default(API_SERVICE_DEFAULTS.RATE_LIMIT_RPM);

/**
 * Rate limiting - window size in minutes
 */
export const RATE_LIMIT_WINDOW = z
  .number()
  .describe(API_SERVICE_DESCRIPTIONS.RATE_LIMIT_WINDOW)
  .int({ error: API_SERVICE_MESSAGES.RATE_LIMIT_WINDOW_INT })
  .min(API_SERVICE_LIMITS.RATE_LIMIT_WINDOW_MIN, { error: API_SERVICE_MESSAGES.RATE_LIMIT_WINDOW_MIN })
  .max(API_SERVICE_LIMITS.RATE_LIMIT_WINDOW_MAX, { error: API_SERVICE_MESSAGES.RATE_LIMIT_WINDOW_MAX })
  .default(API_SERVICE_DEFAULTS.RATE_LIMIT_WINDOW);

/**
 * API timeout in milliseconds
 */
export const API_TIMEOUT = z
  .number()
  .describe(API_SERVICE_DESCRIPTIONS.API_TIMEOUT)
  .int({ error: API_SERVICE_MESSAGES.API_TIMEOUT_INT })
  .min(API_SERVICE_LIMITS.API_TIMEOUT_MIN, { error: API_SERVICE_MESSAGES.API_TIMEOUT_MIN })
  .max(API_SERVICE_LIMITS.API_TIMEOUT_MAX, { error: API_SERVICE_MESSAGES.API_TIMEOUT_MAX })
  .default(API_SERVICE_DEFAULTS.API_TIMEOUT);

/**
 * Maximum file upload size in bytes
 */
export const MAX_FILE_SIZE = z
  .number()
  .describe(API_SERVICE_DESCRIPTIONS.MAX_FILE_SIZE)
  .int({ error: API_SERVICE_MESSAGES.MAX_FILE_SIZE_INT })
  .min(API_SERVICE_LIMITS.MAX_FILE_SIZE_MIN, { error: API_SERVICE_MESSAGES.MAX_FILE_SIZE_MIN })
  .max(API_SERVICE_LIMITS.MAX_FILE_SIZE_MAX, { error: API_SERVICE_MESSAGES.MAX_FILE_SIZE_MAX })
  .default(API_SERVICE_DEFAULTS.MAX_FILE_SIZE);

/**
 * Log level for application logging
 */
export const LOG_LEVEL = z
  .enum([...API_SERVICE_ENUM_OPTIONS.LOG_LEVEL])
  .describe(API_SERVICE_DESCRIPTIONS.LOG_LEVEL)
  .default(API_SERVICE_DEFAULTS.LOG_LEVEL);

/**
 * Application environment
 */
export const NODE_ENV = z
  .enum([...API_SERVICE_ENUM_OPTIONS.NODE_ENV])
  .describe(API_SERVICE_DESCRIPTIONS.NODE_ENV)
  .default(API_SERVICE_DEFAULTS.NODE_ENV);

/**
 * Server port number
 */
export const PORT = z
  .number()
  .describe(API_SERVICE_DESCRIPTIONS.PORT)
  .int({ error: API_SERVICE_MESSAGES.PORT_INT })
  .min(API_SERVICE_LIMITS.PORT_MIN, { error: API_SERVICE_MESSAGES.PORT_MIN })
  .max(API_SERVICE_LIMITS.PORT_MAX, { error: API_SERVICE_MESSAGES.PORT_MAX })
  .default(API_SERVICE_DEFAULTS.PORT);

/**
 * Server host address
 */
export const HOST = z
  .string()
  .describe(API_SERVICE_DESCRIPTIONS.HOST)
  .default(API_SERVICE_DEFAULTS.HOST);

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
