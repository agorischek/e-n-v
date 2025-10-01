import {type ZodSchema} from "zod";

export type SchemaMap = Record<string, ZodSchema>;

export type SecretPattern = string | RegExp;