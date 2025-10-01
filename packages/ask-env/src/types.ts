import type z from "zod";

export type SchemaMap = Record<string, z.ZodSchema>;

export type SecretPattern = string | RegExp;