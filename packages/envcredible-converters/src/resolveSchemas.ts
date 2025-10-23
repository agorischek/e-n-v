import type { TypedEnvVarSchema } from "@envcredible/core";
import { resolveSchema } from "./resolveSchema";

/**
 * Type that represents any schema value in an EnvVarSchemaMap.
 * This includes Zod schemas (v3 or v4) and already-resolved EnvVarSchemas.
 */
export type SchemaMapValue = unknown;

/**
 * Map of environment variable names to schemas (Zod or EnvVar schemas)
 */
export type EnvVarSchemaMap = Record<string, SchemaMapValue>;

/**
 * Check if a value is already a TypedEnvVarSchema
 */
function isTypedEnvVarSchema(value: unknown): value is TypedEnvVarSchema {
  if (!value || typeof value !== "object") return false;
  
  const candidate = value as any;
  return Boolean(
    candidate.type && 
    typeof candidate.required === "boolean" &&
    typeof candidate.process === "function" &&
    ["string", "number", "boolean", "enum"].includes(candidate.type)
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
  
  for (const [key, rawSchema] of Object.entries(schemas)) {
    try {
      // If it's already a TypedEnvVarSchema, use it directly
      if (isTypedEnvVarSchema(rawSchema)) {
        resolved[key] = rawSchema;
      } else {
        // Try to convert using the schema converter system
        resolved[key] = resolveSchema(rawSchema);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Failed to resolve schema for environment variable "${key}": ${message}`
      );
    }
  }
  
  return resolved;
}