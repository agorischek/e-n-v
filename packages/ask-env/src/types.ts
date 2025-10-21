import type { CompatibleZodSchema } from "@envcredible/schematization";
import type { EnvVarSpec } from "@envcredible/schematization";

export type EnvVarSchemaMap = Record<string, CompatibleZodSchema | EnvVarSpec>;
