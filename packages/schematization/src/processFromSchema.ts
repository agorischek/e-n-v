import type { CompatibleZodSchema } from "./zodCompat";
import { isZodV4Schema } from "./zodCompat";
import * as z4core from "zod/v4/core";
import type { EnvVarType } from "@envcredible/types";

type SafeParseResult =
  | { success: true; data: unknown }
  | {
    success: false;
    error: { issues: Array<{ message: string }> };
  };

function safeParseCompat(
  schema: CompatibleZodSchema,
  value: unknown,
): SafeParseResult {
  if (isZodV4Schema(schema)) {
    return z4core.safeParse(schema, value) as SafeParseResult;
  }

  const maybeSafeParse = (
    schema as {
      safeParse?: (input: unknown) => SafeParseResult;
    }
  ).safeParse;

  if (typeof maybeSafeParse === "function") {
    return maybeSafeParse.call(schema, value);
  }

  return z4core.safeParse(
    schema as unknown as z4core.$ZodType,
    value,
  ) as SafeParseResult;
}

/**
 * Creates a process function from a Zod schema.
 * First tries to parse the value with the schema (which may include z.coerce).
 * If that succeeds, returns the parsed value.
 * If that fails, throws an error with the validation message.
 */
export function processFromSchema<T>(
  schema: CompatibleZodSchema,
  type: EnvVarType,
  values?: readonly string[]
): (value: string) => T | undefined {
  return (value: string): T | undefined => {
    // First try parsing with the Zod schema (which may include z.coerce)
    const result = safeParseCompat(schema, value);
    if (result.success) {
      return result.data as T;
    }
    else {
      throw new Error(
        `Failed to parse value "${value}": ${result.error.issues
          .map((issue) => issue.message)
          .join("; ")}`,
      );
    }
  };
}