// Main API - resolveSchema is the primary entry point
export { resolveSchema, registerConverter, getConverters } from "./resolveSchema";

// Schema map resolution for multiple schemas
export { resolveSchemas } from "./resolveSchemas";
export type { EnvVarSchemaMap, SchemaMapValue } from "./resolveSchemas";

// Schema converter interface and implementations
export type { SchemaConverter } from "./SchemaConverter";
export { ZodV3Converter, zodV3Converter } from "./converters/ZodV3Converter";
export { ZodV4Converter, zodV4Converter } from "./converters/ZodV4Converter";

