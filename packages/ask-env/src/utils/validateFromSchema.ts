import type z from "zod";

/**
 * Higher-order function that returns a validator function for a given schema
 */
export function validateFromSchema(schema: z.ZodSchema) {
  return (value: unknown): string | undefined => {
    const result = schema.safeParse(value);
    if (result.success) {
      return undefined; // Valid
    }
    return result.error.errors.map((e) => e.message).join(", ");
  };
}