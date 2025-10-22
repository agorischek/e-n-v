import type { CompatibleZodSchema } from "@envcredible/reflection";
import type { EnvVarSpec } from "@envcredible/reflection";

export type EnvVarSchemaMap = Record<string, CompatibleZodSchema | EnvVarSpec>;
