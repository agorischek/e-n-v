import type { TypedEnvVarSchema } from "@envcredible/core";

/**
 * Interface for schema converters that can convert external schema types
 * to envcredible's TypedEnvVarSchema format.
 */
export interface SchemaConverter<T = unknown> {
  /**
   * Type guard to check if this converter can handle the given schema
   */
  applies(schema: unknown): schema is T;
  
  /**
   * Convert the schema to a TypedEnvVarSchema
   */
  convert(schema: T): TypedEnvVarSchema;
}