import type { StringEnvVarSchema } from "./StringEnvVarSchema";
import type { NumberEnvVarSchema } from "./NumberEnvVarSchema";
import type { BooleanEnvVarSchema } from "./BooleanEnvVarSchema";
import type { EnumEnvVarSchema } from "./EnumEnvVarSchema";

// Import the actual classes for instanceof checks
import { StringEnvVarSchema as StringEnvVarSchemaClass } from "./StringEnvVarSchema";
import { NumberEnvVarSchema as NumberEnvVarSchemaClass } from "./NumberEnvVarSchema";
import { BooleanEnvVarSchema as BooleanEnvVarSchemaClass } from "./BooleanEnvVarSchema";
import { EnumEnvVarSchema as EnumEnvVarSchemaClass } from "./EnumEnvVarSchema";

export type TypedEnvVarSchema =
  | StringEnvVarSchema
  | NumberEnvVarSchema
  | BooleanEnvVarSchema
  | EnumEnvVarSchema<any>;

/**
 * Type guard to check if a value is a TypedEnvVarSchema instance
 */
export function isTypedEnvVarSchema(value: unknown): value is TypedEnvVarSchema {
  return value instanceof StringEnvVarSchemaClass ||
         value instanceof NumberEnvVarSchemaClass ||
         value instanceof BooleanEnvVarSchemaClass ||
         value instanceof EnumEnvVarSchemaClass;
}