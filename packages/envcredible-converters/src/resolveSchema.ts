import type { TypedEnvVarSchema } from "@envcredible/core";
import type { SchemaConverter } from "./SchemaConverter";
import { zodV3Converter } from "./converters/ZodV3Converter";
import { zodV4Converter } from "./converters/ZodV4Converter";

/**
 * Registry of available schema converters
 */
const converters: SchemaConverter[] = [
  zodV4Converter, // Try v4 first as it's more specific
  zodV3Converter,
];

/**
 * Resolve any supported schema to a TypedEnvVarSchema.
 * 
 * This is the main entry point for converting external schemas 
 * (like Zod schemas) to envcredible's internal schema format.
 * 
 * @param schema - The schema to convert (e.g., Zod v3/v4 schema)
 * @returns TypedEnvVarSchema that can be used with envcredible
 * @throws Error if no converter can handle the schema
 */
export function resolveSchema(schema: unknown): TypedEnvVarSchema {
  for (const converter of converters) {
    if (converter.applies(schema)) {
      return converter.convert(schema);
    }
  }
  
  throw new Error(
    `No converter found for schema. Supported types: Zod v3, Zod v4. ` +
    `Received: ${typeof schema}`
  );
}

/**
 * Register a custom schema converter
 * 
 * @param converter - The converter to register
 */
export function registerConverter(converter: SchemaConverter): void {
  converters.unshift(converter); // Add to beginning for priority
}

/**
 * Get all registered converters
 */
export function getConverters(): readonly SchemaConverter[] {
  return [...converters];
}
