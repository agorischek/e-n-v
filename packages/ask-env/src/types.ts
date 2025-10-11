import type { CompatibleZodSchema } from "./specification/zodCompat";

export type SchemaMap = Record<string, CompatibleZodSchema>;

export type SecretPattern = string | RegExp;