import type { StringEnvVarSchema } from "./StringEnvVarSchema";
import type { NumberEnvVarSchema } from "./NumberEnvVarSchema";
import type { BooleanEnvVarSchema } from "./BooleanEnvVarSchema";
import type { EnumEnvVarSchema } from "./EnumEnvVarSchema";

export type TypedEnvVarSchema =
  | StringEnvVarSchema
  | NumberEnvVarSchema
  | BooleanEnvVarSchema
  | EnumEnvVarSchema<any>;