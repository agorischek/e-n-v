import type { TypedEnvVarSchema } from "@envcredible/core";
import type { ZodTypeAny } from "zod";
import type { $ZodType } from "zod/v4/core";

/**
 * Joi schema interface (simplified for type checking)
 */
export interface JoiSchema {
  _type?: string;
  _flags?: any;
  validate?: (value: unknown, options?: any) => { error?: any; value?: unknown };
  describe?: () => any;
  isJoi?: boolean;
}

/**
 * Map of environment variable names to supported schema types
 */
export type EnvVarSchemaMap = Record<string, SupportedSchema>;

export type SupportedSchema = ZodTypeAny | $ZodType | JoiSchema | TypedEnvVarSchema;