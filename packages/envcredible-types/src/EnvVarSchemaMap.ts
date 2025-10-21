import type { CompatibleZodSchema } from "./CompatibleZodSchema";
import type { EnvVarSpec } from "./EnvVarSpec";

export type EnvVarSchemaMap = Record<string, CompatibleZodSchema | EnvVarSpec>;