import type { EnvVarSchema } from "@e-n-v/core";

/**
 * Interface for schema converters that can convert external schema types
 * to envcredible's EnvVarSchema format.
 */
export interface SchemaConverter<T = unknown> {
  /**
   * Type guard to check if this converter can handle the given schema
   */
  applies(schema: unknown): schema is T;

  /**
   * Convert the schema to a EnvVarSchema
   */
  convert(schema: T): EnvVarSchema;
}
