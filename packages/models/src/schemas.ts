import type { EnvVarSchema } from "@e-n-v/core";
import type { AnySchema } from "joi";
import type { ZodTypeAny } from "zod";
import type { $ZodType } from "zod/v4/core";

export type JoiSchema = AnySchema;

export type ZodV3Schema = ZodTypeAny;

export type ZodV4Schema = $ZodType;

export type Schema = ZodV3Schema | ZodV4Schema | JoiSchema | EnvVarSchema;

export type SupportedSchema = Schema;

export type EnvVarSchemaMap = Record<string, SupportedSchema>;
