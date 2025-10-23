import type { TypedEnvVarSchema } from "@envcredible/core";
import type { ZodTypeAny } from "zod";
import type { $ZodType } from "zod/v4/core";

/**
 * Map of environment variable names to supported schema types
 */
export type EnvVarSchemaMap = Record<string, SupportedSchema>;

export type SupportedSchema = ZodTypeAny | $ZodType | TypedEnvVarSchema;