import type { CompatibleZodSchema } from "../specification/zodCompat";
import { isZodV4Schema } from "../specification/zodCompat";
import * as z4core from "zod/v4/core";

/**
 * Higher-order function that returns a validator function for a given schema
 */
export function validateFromSchema(schema: CompatibleZodSchema) {
  return (value: unknown): string | undefined => {
    const result = safeParseCompat(schema, value);
    if (result.success) {
      return undefined; // Valid
    }
    return result.error.issues.map((issue) => issue.message).join(", "); // Return error messages
  };
}

type SafeParseResult =
  | { success: true; data: unknown }
  | {
      success: false;
      error: { issues: Array<{ message: string }> };
    };

function safeParseCompat(
  schema: CompatibleZodSchema,
  value: unknown
): SafeParseResult {
  if (isZodV4Schema(schema)) {
    return z4core.safeParse(schema, value) as SafeParseResult;
  }

  const maybeSafeParse = (schema as {
    safeParse?: (input: unknown) => SafeParseResult;
  }).safeParse;

  if (typeof maybeSafeParse === "function") {
    return maybeSafeParse.call(schema, value);
  }

  return z4core.safeParse(
    schema as unknown as z4core.$ZodType,
    value
  ) as SafeParseResult;
}