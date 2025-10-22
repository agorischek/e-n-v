// Main converter function - routes to appropriate v3 or v4 converter
export { fromZodSchema } from "./fromZodSchema";

// Individual converter functions for direct use
export { convertFromZodV3Schema, isZodV3Schema } from "./zodV3Converter";
export { convertFromZodV4Schema, isZodV4Schema } from "./zodV4Converter";

// Utility functions for backward compatibility
export { processWithZodSchema, isEnvVarSchema } from "./utils";

// Type definitions
export type CompatibleZodSchema = any; // Any Zod schema (v3 or v4)

// Additional utility for compatibility
export function isCompatibleZodSchema(value: unknown): value is CompatibleZodSchema {
  if (!value || typeof value !== "object") {
    return false;
  }

  // Check for v4 schema
  if ("_zod" in value) {
    return true;
  }

  // Check for v3 schema
  if ("_def" in value) {
    return true;
  }

  // Check for parse/safeParse methods (more general check)
  const candidate = value as any;
  return typeof candidate.parse === "function" || typeof candidate.safeParse === "function";
}

// Re-export commonly needed types from core
export type {
  EnvVarType,
  EnvVarSchemaDetails,
  StringEnvVarSchema,
  NumberEnvVarSchema,
  BooleanEnvVarSchema,
  EnumEnvVarSchema,
  TypedEnvVarSchema as EnvVarSchema,
} from "@envcredible/core";