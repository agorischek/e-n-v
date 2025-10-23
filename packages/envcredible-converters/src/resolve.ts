import type { TypedEnvVarSchema } from "@envcredible/core";
import { isTypedEnvVarSchema } from "@envcredible/core";
import type { EnvVarSchemaMap, SupportedSchema } from "./types";
import { converters } from "./converters";

/**
 * Resolve any supported schema to a TypedEnvVarSchema.
 * 
 * This is the main entry point for converting external schemas 
 * (like Zod schemas) to envcredible's internal schema format.
 * If the input is already a TypedEnvVarSchema, it returns it directly.
 * 
 * @param schema - The schema to convert (e.g., Zod v3/v4 schema or TypedEnvVarSchema)
 * @returns TypedEnvVarSchema that can be used with envcredible
 * @throws Error if no converter can handle the schema
 */
export function resolveSchema(schema: SupportedSchema): TypedEnvVarSchema {
  // If it's already a TypedEnvVarSchema, return it directly
  if (isTypedEnvVarSchema(schema)) {
    return schema;
  }

  // Try to convert using registered converters
  for (const converter of converters) {
    if (converter.applies(schema)) {
      return converter.convert(schema);
    }
  }

  throw new Error(
    `No converter found for schema. Supported types: Zod v3, Zod v4, TypedEnvVarSchema. ` +
    `Received: ${typeof schema}`
  );
}

/**
 * Resolve mixed schema map (Zod schemas or TypedEnvVarSchema) to pure TypedEnvVarSchema map.
 * 
 * This function takes a map where values can be:
 * - Zod v3 schemas  
 * - Zod v4 schemas
 * - Already resolved TypedEnvVarSchema instances
 * 
 * And converts everything to TypedEnvVarSchema instances that can be used throughout envcredible.
 * 
 * @param schemas - Object mapping environment variable names to various schema types
 * @returns Record mapping env var names to TypedEnvVarSchema instances
 */
export function resolveSchemas(schemas: EnvVarSchemaMap): Record<string, TypedEnvVarSchema> {
  const resolved: Record<string, TypedEnvVarSchema> = {};

  for (const [key, schema] of Object.entries(schemas)) {
    try {
      resolved[key] = resolveSchema(schema);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Failed to resolve schema for environment variable "${key}": ${message}`
      );
    }
  }

  return resolved;
}