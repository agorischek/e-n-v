import type { CompatibleZodSchema } from "@envcredible/reflection";
import type { EnvVarSchema } from "@envcredible/reflection";

export type EnvVarSchemaMap = Record<string, CompatibleZodSchema | EnvVarSchema>;
