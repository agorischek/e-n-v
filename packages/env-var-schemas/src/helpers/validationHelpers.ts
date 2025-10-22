import type { StringEnvVarSchemaInput, NumberEnvVarSchemaInput } from "../../../envcredible-core/src";
import { processWithZodSchema } from "@envcredible/converters";
import { z } from "zod";

/**
 * Common validation patterns for environment variables using Zod internally
 */

/**
 * Creates a URL validation processor with optional protocol requirements
 */
export const createUrlValidator = (
  protocolPattern?: RegExp,
  protocolErrorMessage?: string
) => {
  let schema = z.string().url();
  
  if (protocolPattern) {
    schema = schema.refine(
      (url) => protocolPattern.test(url),
      { message: protocolErrorMessage || "Invalid protocol" }
    );
  }
  
  return processWithZodSchema<string>(schema, "string");
};

/**
 * Creates a string length validation processor
 */
export const createStringLengthValidator = (
  minLength: number,
  minLengthMessage: string,
  maxLength?: number,
  maxLengthMessage?: string
) => {
  let schema = z.string().min(minLength, { message: minLengthMessage });
  
  if (maxLength) {
    schema = schema.max(maxLength, { message: maxLengthMessage });
  }
  
  return processWithZodSchema<string>(schema, "string");
};

/**
 * Creates an exact length validation processor
 */
export const createExactLengthValidator = (
  length: number,
  errorMessage: string
) => processWithZodSchema<string>(
  z.string().length(length, { message: errorMessage }),
  "string"
);

/**
 * Creates a regex pattern validation processor
 */
export const createPatternValidator = (
  pattern: RegExp,
  errorMessage: string
) => processWithZodSchema<string>(
  z.string().regex(pattern, { message: errorMessage }),
  "string"
);

/**
 * Creates a required string validator (non-empty)
 */
export const createRequiredStringValidator = (
  errorMessage: string
) => processWithZodSchema<string>(
  z.string().min(1, { message: errorMessage }),
  "string"
);

/**
 * Creates a number range validation processor
 */
export const createNumberRangeValidator = (
  min: number,
  minMessage: string,
  max: number,
  maxMessage: string,
  integerOnly = true
) => {
  let schema = z.coerce.number()
    .min(min, { message: minMessage })
    .max(max, { message: maxMessage });
    
  if (integerOnly) {
    schema = schema.int({ message: "Must be an integer" });
  }
  
  return processWithZodSchema<number>(schema, "number");
};

/**
 * Creates a port number validation processor (1024-65535)
 */
export const createPortValidator = (
  minMessage = "Port must be >= 1024 (avoid reserved ports)",
  maxMessage = "Port must be <= 65535"
) => createNumberRangeValidator(1024, minMessage, 65535, maxMessage, true);

/**
 * Creates a timeout validation processor (in seconds)
 */
export const createTimeoutValidator = (
  min: number,
  max: number,
  minMessage = `Timeout must be at least ${min} second${min === 1 ? '' : 's'}`,
  maxMessage = `Timeout should not exceed ${max} second${max === 1 ? '' : 's'}`
) => createNumberRangeValidator(min, minMessage, max, maxMessage, true);

/**
 * Creates a database port validator (1-65535)
 */
export const createDatabasePortValidator = (
  minMessage = "Port must be >= 1",
  maxMessage = "Port must be <= 65535"
) => createNumberRangeValidator(1, minMessage, 65535, maxMessage, true);

/**
 * Creates a percentage validator (0-100)
 */
export const createPercentageValidator = (
  minMessage = "Must be >= 0",
  maxMessage = "Must be <= 100"
) => createNumberRangeValidator(0, minMessage, 100, maxMessage, false);

/**
 * Helper to create string schema input with common validation patterns
 */
export const createStringSchemaInput = (
  description: string,
  validator: (value: string) => string | undefined,
  overrides: Partial<StringEnvVarSchemaInput> = {}
): StringEnvVarSchemaInput => ({
  description,
  process: validator,
  ...overrides,
});

/**
 * Helper to create number schema input with common validation patterns
 */
export const createNumberSchemaInput = (
  description: string,
  validator: (value: string) => number | undefined,
  defaultValue?: number,
  overrides: Partial<NumberEnvVarSchemaInput> = {}
): NumberEnvVarSchemaInput => ({
  description,
  process: validator,
  ...(defaultValue !== undefined && { default: defaultValue }),
  ...overrides,
});

/**
 * Creates a validator that combines length and pattern validation for API keys
 */
export const createApiKeyValidator = (
  minLength: number,
  pattern: RegExp,
  minLengthMessage: string,
  patternMessage: string
) => processWithZodSchema<string>(
  z.string()
    .min(minLength, { message: minLengthMessage })
    .regex(pattern, { message: patternMessage }),
  "string"
);

/**
 * Creates a connection string validator for specific patterns
 */
export const createConnectionStringValidator = (
  pattern: RegExp,
  errorMessage: string
) => createPatternValidator(pattern, errorMessage);