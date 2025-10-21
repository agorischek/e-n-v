// Types and interfaces
export type { EnvVarType } from "./EnvVarType";
export type {
  EnvVarSchema,
  EnvVarSpec,
  EnvVarSchemaDetails,
  StringEnvVarSchema,
  NumberEnvVarSchema,
  BooleanEnvVarSchema,
  EnumEnvVarSchema,
} from "./EnvVarSchema";

// Zod compatibility types and utilities
export type {
  CompatibleZodSchema,
  SchemaDef,
  PeeledSchemaResult,
} from "./zodCompat";

// Functions
export { isEnvVarSchema } from "./EnvVarSchema";
export { fromZodSchema } from "./fromZodSchema";
export {
  isCompatibleZodSchema,
  isZodV4Schema,
  peelSchema,
  extractEnumValues,
  resolveEnvVarType,
  getSchemaDef,
  getDefType,
  getSchemaDescription,
  getInnerSchema,
  getDefaultFromDef,
} from "./zodCompat";
export { processFromSchema } from "./processFromSchema";