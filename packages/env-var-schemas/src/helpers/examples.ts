/**
 * Examples showing how to use Zod inline for validation in envcredible schemas
 * This approach leverages Zod's validation power while returning native EnvVarSchema objects
 */

import { StringEnvVarSchema, NumberEnvVarSchema } from "../../../envcredible-core/src";
import { createZodProcessor } from "./zodHelpers";
import { z } from "zod";

// Example patterns (these would come from shared files)
const patterns = {
  httpProtocol: /^https?:\/\//,
  httpsProtocol: /^https:\/\//,
  openaiApiKey: /^sk-[A-Za-z0-9]{20,}$/,
  redisUrl: /^rediss?:\/\/(?:[^:@/\s]+(?::[^@/\s]*)?@)?[^:/\s]+(?::\d+)?(?:\/\d+)?(?:\?.*)?$/,
  azureConnectionString: /^DefaultEndpointsProtocol=https;AccountName=[^;]+;AccountKey=[^;]+;EndpointSuffix=.+$/,
  jwtTokenDuration: /^\d+[smhd]$/,
} as const;

// Example messages and constraints (these would come from shared files)
const messages = {
  apiKeyMin: "API key must be at least 8 characters long",
  openaiApiKeyFormat: "OpenAI API key must start with 'sk-' and contain only letters and numbers",
  httpsRequired: "Must use HTTPS for security",
  portRequired: "Port is required",
  urlRequired: "URL is required",
  exactLength40: "Must be exactly 40 characters",
  jwtDurationFormat: "Must be in format like '15m', '1h', '7d'",
} as const;

const constraints = {
  apiKeyMinLength: 8,
  openaiApiKeyMinLength: 40,
} as const;

// Example 1: Simple API key with minimum length
export const simpleApiKey = (input = {}) =>
  new StringEnvVarSchema({
    description: "API key for authentication",
    process: createZodProcessor(
      z.string().min(constraints.apiKeyMinLength, { message: messages.apiKeyMin })
    ),
    ...input,
  });

// Example 2: OpenAI API key with length + pattern validation
export const openaiApiKey = (input = {}) =>
  new StringEnvVarSchema({
    description: "OpenAI API key for authenticating requests",
    process: createZodProcessor(
      z.string()
        .min(constraints.openaiApiKeyMinLength, { message: "Must be at least 40 characters" })
        .regex(patterns.openaiApiKey, { message: messages.openaiApiKeyFormat }),
    ),
    ...input,
  });

// Example 3: URL with HTTPS requirement
export const webhookUrl = (input = {}) =>
  new StringEnvVarSchema({
    description: "Webhook URL for notifications",
    process: createZodProcessor(
      z.string()
        .url({ message: "Must be a valid URL" })
        .refine(
          (url) => patterns.httpsProtocol.test(url),
          { message: messages.httpsRequired }
        ),
    ),
    ...input,
  });

// Example 4: Redis connection URL
export const redisUrl = (input = {}) =>
  new StringEnvVarSchema({
    description: "Redis connection URL",
    process: createZodProcessor(
      z.string().regex(patterns.redisUrl, { message: "Must be a valid Redis URL format" }),
    ),
    ...input,
  });

// Example 5: Required string (non-empty)
export const databaseHost = (input = {}) =>
  new StringEnvVarSchema({
    description: "Database host address",
    process: createZodProcessor(
      z.string().min(1, { message: "Database host is required" }),
    ),
    ...input,
  });

// Example 6: Exact length validation (e.g., license keys)
export const newRelicLicenseKey = (input = {}) =>
  new StringEnvVarSchema({
    description: "New Relic license key",
    process: createZodProcessor(
      z.string().length(40, { message: messages.exactLength40 }),
    ),
    ...input,
  });

// Example 7: JWT token duration with pattern
export const jwtTokenDuration = (input = {}) =>
  new StringEnvVarSchema({
    description: "JWT token duration",
    process: createZodProcessor(
      z.string().regex(patterns.jwtTokenDuration, { message: messages.jwtDurationFormat }),
    ),
    default: "15m",
    ...input,
  });

// Example 8: Application port (1024-65535)
export const appPort = (input = {}) =>
  new NumberEnvVarSchema({
    description: "Application port number",
    process: createZodProcessor(
      z.coerce.number()
        .int({ message: "Must be an integer" })
        .min(1024, { message: "Port must be >= 1024 (avoid reserved ports)" })
        .max(65535, { message: "Port must be <= 65535" }),
    ),
    default: 3000,
    ...input,
  });

// Example 9: Database port (1-65535)
export const databasePort = (input = {}) =>
  new NumberEnvVarSchema({
    description: "Database port number",
    process: createZodProcessor(
      z.coerce.number()
        .int({ message: "Must be an integer" })
        .min(1, { message: "Port must be >= 1" })
        .max(65535, { message: "Port must be <= 65535" }),
    ),
    ...input,
  });

// Example 10: Timeout in seconds
export const requestTimeout = (input = {}) =>
  new NumberEnvVarSchema({
    description: "Request timeout in seconds",
    process: createZodProcessor(
      z.coerce.number()
        .int({ message: "Must be an integer" })
        .min(1, { message: "Timeout must be at least 1 second" })
        .max(300, { message: "Timeout should not exceed 300 seconds" }),
    ),
    default: 30,
    ...input,
  });

// Example 11: Percentage value
export const samplingRate = (input = {}) =>
  new NumberEnvVarSchema({
    description: "Sampling rate percentage",
    process: createZodProcessor(
      z.coerce.number()
        .min(0, { message: "Must be >= 0" })
        .max(100, { message: "Must be <= 100" }),
    ),
    default: 100,
    ...input,
  });

// Example 12: Connection string with specific pattern
export const azureStorageConnectionString = (input = {}) =>
  new StringEnvVarSchema({
    description: "Azure Storage connection string",
    process: createZodProcessor(
      z.string().regex(patterns.azureConnectionString, {
        message: "Must be a valid Azure Storage connection string"
      }),
    ),
    ...input,
  });

// Example 13: Optional string with pattern (organization ID)
export const organizationId = (input = {}) =>
  new StringEnvVarSchema({
    description: "Organization identifier",
    process: createZodProcessor(
      z.string().regex(/^org-[A-Za-z0-9_-]{8,}$/, { message: "Must start with 'org-'" }),
    ),
    required: false,
    ...input,
  });

// Example 14: Complex validation with multiple constraints
export const complexApiKey = (input = {}) =>
  new StringEnvVarSchema({
    description: "Complex API key with multiple validation rules",
    process: createZodProcessor(
      z.string()
        .min(32, { message: "Must be at least 32 characters" })
        .max(128, { message: "Must be no more than 128 characters" })
        .regex(/^[A-Za-z0-9_-]+$/, { message: "Must contain only letters, numbers, underscores, and hyphens" })
        .refine(
          (key) => !key.includes('test') && !key.includes('example'),
          { message: "Cannot contain 'test' or 'example'" }
        ),
    ),
    secret: true,
    ...input,
  });