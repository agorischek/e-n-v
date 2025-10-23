import { z } from "zod";
import type * as z4 from "zod/v4/core";

/**
 * Creates a process function from a Zod schema for use with EnvVarSchema constructors.
 * 
 * This helper is specifically for the env-var-schemas package to create process functions
 * that can be passed to StringEnvVarSchema, NumberEnvVarSchema, etc. constructors.
 * 
 * The schema itself defines the validation and type conversion logic. For environment
 * variables that need coercion from strings, use z.coerce.number() or z.coerce.boolean().
 * 
 * @param schema - The Zod schema to convert
 * @returns A process function that can be used in EnvVarSchema constructors
 * 
 * @example
 * ```typescript
 * // String validation
 * new StringEnvVarSchema({
 *   process: createZodProcessor(z.string().email()),
 *   description: "Email address",
 * });
 * 
 * // Number with coercion
 * new NumberEnvVarSchema({
 *   process: createZodProcessor(z.coerce.number().min(0)),
 *   description: "Port number",
 * });
 * 
 * // Boolean with coercion  
 * new BooleanEnvVarSchema({
 *   process: createZodProcessor(z.coerce.boolean()),
 *   description: "Feature flag",
 * });
 * ```
 */
export function createZodProcessor<TSchema extends z4.$ZodType>(
    schema: TSchema
): (value: string) => z4.output<TSchema> | undefined {
    return (value: string): z4.output<TSchema> | undefined => {
        const result = z.safeParse(schema, value);
        if (result.success) {
            return result.data;
        }

        throw new Error(
            result.error.issues
                .map((issue) => issue.message)
                .join("; ")
        );
    };
}