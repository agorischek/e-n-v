import type { EnvVarSpec } from "./specification";

/**
 * CompatibleZodSchema is intentionally left as `unknown` here to avoid
 * forcing a hard dependency on zod at runtime. Consumers can narrow it to a
 * concrete zod type if they depend on zod.
 */
export type CompatibleZodSchema = unknown;

export type EnvVarSchemaMap = Record<string, CompatibleZodSchema | EnvVarSpec>;

export type SecretPattern = string | RegExp;