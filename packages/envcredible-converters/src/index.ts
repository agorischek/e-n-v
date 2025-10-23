// Main API - resolveSchema is the primary entry point
export { resolveSchema, registerConverter, getConverters } from "./resolveSchema";

// Schema converter interface and implementations
export type { SchemaConverter } from "./SchemaConverter";
export { ZodV3Converter, zodV3Converter } from "./converters/ZodV3Converter";
export { ZodV4Converter, zodV4Converter } from "./converters/ZodV4Converter";

// Re-export core types for convenience
export type {
  EnvVarType,
  EnvVarSchemaDetails,
  StringEnvVarSchema,
  NumberEnvVarSchema,
  BooleanEnvVarSchema,
  EnumEnvVarSchema,
  TypedEnvVarSchema,
} from "@envcredible/core";

