import type {
  StringEnvVarSchema,
  NumberEnvVarSchema,
  BooleanEnvVarSchema,
  EnumEnvVarSchema,
  EnvVarSchemaBase,
} from "@e-n-v/core";
import type { Schema } from "./schemas";
import type { ZodTypeAny } from "zod";
import type { $ZodType } from "zod/v4/core";
import type { AnySchema } from "joi";

/**
 * Supported schema types - local definition to avoid circular dependencies
 */
export type SupportedSchema = Schema;

/**
 * Format for schema definitions
 * - "flat": Traditional flat schema format (default)
 * - "client-server": Separate client and server schemas (for t3-oss/env-core compatibility)
 */
export type SchemasFormat = "flat" | "client-server";

/**
 * Client-server schema format used by t3-oss/env-core
 * Separates environment variables into client-side and server-side schemas
 */
export type ClientServerSchemas = {
  client: Record<string, SupportedSchema>;
  server: Record<string, SupportedSchema>;
};

type InferZodOutput<T> = T extends { _output: infer Output }
  ? Output
  : T extends { _type: infer LegacyOutput }
    ? LegacyOutput
    : never;

type InferJoiOutput<T> = T extends {
  validate: (...args: any[]) => infer Result;
}
  ? Result extends { value: infer Value }
    ? Value
    : Result extends Promise<infer AsyncResult>
      ? AsyncResult extends { value: infer AsyncValue }
        ? AsyncValue
        : unknown
      : unknown
  : T extends {
        validateAsync: (...args: any[]) => Promise<infer AsyncValue>;
      }
    ? AsyncValue
    : unknown;

/**
 * Infer the TypeScript type from an EnvVarSchema instance
 * Uses the schema's type property and values to determine the correct TypeScript type
 */
export type InferSchemaType<T> = T extends {
  readonly type: "string";
}
  ? string
  : T extends {
        readonly type: "number";
      }
    ? number
    : T extends {
          readonly type: "boolean";
        }
      ? boolean
      : T extends {
            readonly type: "enum";
            readonly values: readonly (infer U)[];
          }
        ? U
        : T extends EnumEnvVarSchema<infer U>
          ? U
          : T extends NumberEnvVarSchema
            ? number
            : T extends StringEnvVarSchema
              ? string
              : T extends BooleanEnvVarSchema
                ? boolean
                : T extends EnvVarSchemaBase<infer U>
                  ? U
                  : T extends AnySchema
                    ? InferJoiOutput<T>
                    : T extends ZodTypeAny
                      ? InferZodOutput<T>
                      : T extends $ZodType
                        ? InferZodOutput<T>
                        : unknown;

/**
 * Infer whether a schema field is optional based on its required property
 */
export type InferOptional<T> = T extends { required: false }
  ? true
  : T extends { required: true }
    ? false
    : T extends { required: boolean }
      ? boolean
      : false; // default is required

/**
 * Utility type to flatten complex generic types for better IDE display
 */
type Simplify<T> = {
  [K in keyof T]: T[K];
} & {};

/**
 * Infer the complete environment type from a schemas record
 * Handles optional vs required fields properly
 * Uses Simplify to flatten the type display in IDEs
 */
export type InferEnvType<T extends Record<string, SupportedSchema>> = Simplify<{
  [K in keyof T]: InferOptional<T[K]> extends true
    ? InferSchemaType<T[K]> | undefined
    : InferSchemaType<T[K]>;
}>;
