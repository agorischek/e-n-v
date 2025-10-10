import type z from "zod";

/**
 * Higher-order function that returns a validator function for a given schema
 */
export function validateFromSchema<TSchema extends z.ZodSchema>(schema: TSchema) {
  return (value: unknown): string | undefined => {
    const result = schema.safeParse(value);
    if (result.success) {
      return undefined; // Valid
    }
    return result.error.issues.map((issue) => issue.message).join(", "); // Return error messages
  };
}