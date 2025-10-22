import type { CompatibleZodSchema } from "@envcredible/converters";
import type { EnvVarSchema } from "@envcredible/converters";

export type EnvVarSchemaMap = Record<string, CompatibleZodSchema | EnvVarSchema>;
