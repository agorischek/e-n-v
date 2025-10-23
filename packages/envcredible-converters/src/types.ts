import type { TypedEnvVarSchema } from "@envcredible/core";
import type { ZodTypeAny } from "zod";
import type { $ZodType } from "zod/v4/core";
import type { AnySchema } from "joi";

/**
 * Joi schema type using the official Joi TypeScript definitions.
 * We extend it with internal properties that might not be in the public API
 * but are useful for introspection when the public API doesn't provide enough info.
 */
export type JoiSchema = AnySchema & {
  // Internal properties that may be useful as fallbacks
  _type?: string;
  _flags?: {
    default?: unknown;
    description?: string;
    only?: boolean;
    presence?: "required" | "optional" | "forbidden";
    [key: string]: any;
  };
  _valids?: {
    _values?: Set<unknown>;
    [key: string]: any;
  };
  type?: string; // This is actually a public property
};

/**
 * Map of environment variable names to supported schema types
 */
export type EnvVarSchemaMap = Record<string, SupportedSchema>;

export type SupportedSchema = ZodTypeAny | $ZodType | JoiSchema | TypedEnvVarSchema;