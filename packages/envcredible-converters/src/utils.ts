import type { EnvVarType, TypedEnvVarSchema } from "@envcredible/core";
import { fromZodSchema } from "./fromZodSchema";

// Type for any Zod schema (v3 or v4)
type ZodSchema = any;

/**
 * Creates a process function from a Zod schema.
 * First tries to parse the value with the schema (which may include z.coerce).
 * If that succeeds, returns the parsed value.
 * If that fails, throws an error with the validation message.
 */
export function processWithZodSchema<T>(
  schema: ZodSchema,
  type: EnvVarType,
  values?: readonly string[]
): (value: string) => T | undefined {
  // Convert the Zod schema to an EnvVarSchema and use its process function
  const envVarSchema = fromZodSchema(schema);
  
  return (value: string): T | undefined => {
    return envVarSchema.process(value) as T;
  };
}

/**
 * Type guard to check if a value is an EnvVarSchema
 */
export function isEnvVarSchema(value: unknown): value is TypedEnvVarSchema {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<TypedEnvVarSchema> & {
    type?: unknown;
    secret?: unknown;
  };
  
  if (typeof candidate.type !== "string") {
    return false;
  }

  const ENV_VAR_TYPES = new Set(["string", "number", "boolean", "enum"]);
  if (!ENV_VAR_TYPES.has(candidate.type)) {
    return false;
  }

  if ("secret" in candidate && candidate.secret !== undefined) {
    if (candidate.type !== "string" || typeof candidate.secret !== "boolean") {
      return false;
    }
  }

  return typeof candidate.required === "boolean";
}