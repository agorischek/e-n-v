import type { CompatibleZodSchema } from "./specification/zodCompat";
import type { EnvVarSpec } from "./specification/EnvVarSchema";

export type SchemaMap = Record<string, CompatibleZodSchema | EnvVarSpec>;

export type SecretPattern = string | RegExp;