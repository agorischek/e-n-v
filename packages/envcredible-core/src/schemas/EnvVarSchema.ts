import type { StringEnvVarSchema } from "./typed/StringEnvVarSchema";
import type { NumberEnvVarSchema } from "./typed/NumberEnvVarSchema";
import type { BooleanEnvVarSchema } from "./typed/BooleanEnvVarSchema";
import type { EnumEnvVarSchema } from "./typed/EnumEnvVarSchema";

// Import the actual classes for instanceof checks
import { StringEnvVarSchema as StringEnvVarSchemaClass } from "./typed/StringEnvVarSchema";
import { NumberEnvVarSchema as NumberEnvVarSchemaClass } from "./typed/NumberEnvVarSchema";
import { BooleanEnvVarSchema as BooleanEnvVarSchemaClass } from "./typed/BooleanEnvVarSchema";
import { EnumEnvVarSchema as EnumEnvVarSchemaClass } from "./typed/EnumEnvVarSchema";

export type EnvVarSchema =
  | StringEnvVarSchema
  | NumberEnvVarSchema
  | BooleanEnvVarSchema
  | EnumEnvVarSchema<any>;

/**
 * Type guard to check if a value is a EnvVarSchema instance
 */
export function isEnvVarSchema(value: unknown): value is EnvVarSchema {
  return (
    value instanceof StringEnvVarSchemaClass ||
    value instanceof NumberEnvVarSchemaClass ||
    value instanceof BooleanEnvVarSchemaClass ||
    value instanceof EnumEnvVarSchemaClass
  );
}
