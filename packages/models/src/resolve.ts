import type { EnvVarSchema } from "@e-n-v/core";
import { isEnvVarSchema } from "@e-n-v/core";
import type { Schema } from "./schemas";
import { converters } from "../../converters/src/converters";

/**
 * Resolve any supported schema to a EnvVarSchema.
 *
 * This is the main entry point for converting external schemas
 * (like Zod schemas) to envcredible's internal schema format.
 * If the input is already a EnvVarSchema, it returns it directly.
 *
 * @param schema - The schema to convert (e.g., Zod v3/v4 schema or EnvVarSchema)
 * @returns EnvVarSchema that can be used with envcredible
 * @throws Error if no converter can handle the schema
 */
export function resolveSchema(schema: Schema): EnvVarSchema {
  // If it's already a EnvVarSchema, return it directly
  if (isEnvVarSchema(schema)) {
    return schema;
  }

  // Try to convert using registered converters
  for (const converter of converters) {
    if (converter.applies(schema)) {
      return converter.convert(schema);
    }
  }

  throw new Error(
    `No converter found for schema. Supported types: Zod v3, Zod v4, Joi, EnvVarSchema. ` +
      `Received: ${typeof schema}`,
  );
}

/**
 * Resolve mixed schema map (Zod schemas or EnvVarSchema) to pure EnvVarSchema map.
 *
 * This function takes a map where values can be:
 * - Zod v3 schemas
 * - Zod v4 schemas
 * - Already resolved EnvVarSchema instances
 *
 * And converts everything to EnvVarSchema instances that can be used throughout envcredible.
 *
 * @param schemas - Object mapping environment variable names to various schema types
 * @returns Record mapping env var names to EnvVarSchema instances
 */
export function resolveSchemas(
  schemas: Record<string, Schema>,
): Record<string, EnvVarSchema> {
  const resolved: Record<string, EnvVarSchema> = {};

  for (const [key, schema] of Object.entries(schemas)) {
    try {
      resolved[key] = resolveSchema(schema);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Failed to resolve schema for environment variable "${key}": ${message}`,
      );
    }
  }

  return resolved;
}
