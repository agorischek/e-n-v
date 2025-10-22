import type { StringEnvVarSchema } from "./StringEnvVarSchema";
import type { NumberEnvVarSchema } from "./NumberEnvVarSchema";
import type { BooleanEnvVarSchema } from "./BooleanEnvVarSchema";
import type { EnumEnvVarSchema } from "./EnumEnvVarSchema";

export type EnvVarSchemaUnion =
  | StringEnvVarSchema
  | NumberEnvVarSchema
  | BooleanEnvVarSchema
  | EnumEnvVarSchema;