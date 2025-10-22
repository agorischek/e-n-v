import { convertFromZodV3Schema, isZodV3Schema } from "./zodV3Converter";
import { convertFromZodV4Schema, isZodV4Schema } from "./zodV4Converter";
import type { TypedEnvVarSchema } from "@envcredible/core";

// Type for any Zod schema (v3 or v4)
type ZodSchema = any;

export function fromZodSchema(schema: ZodSchema): TypedEnvVarSchema {
  // Determine if this is a v3 or v4 schema and use the appropriate converter
  if (isZodV4Schema(schema)) {
    return convertFromZodV4Schema(schema);
  } else if (isZodV3Schema(schema)) {
    return convertFromZodV3Schema(schema);
  } else {
    // Fallback: assume v3 if we can't determine version
    return convertFromZodV3Schema(schema);
  }
}