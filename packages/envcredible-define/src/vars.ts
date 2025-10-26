import type { SupportedSchema } from "@envcredible/schemata";
import type { EnvDefinitionOptions } from "./EnvDefinitionOptions";

/**
 * Helper function to create EnvDefinitionOptions from just variables
 *
 * @param variables - Map of variable names to their schema definitions
 * @returns EnvDefinitionOptions with the provided variables
 *
 * @example
 * ```typescript
 * import { vars } from "@envcredible/define";
 * import { z } from "zod";
 *
 * const definition = vars({
 *   PORT: z.number(),
 *   DATABASE_URL: z.string().url(),
 *   DEBUG: z.boolean()
 * });
 * ```
 */
export function vars(
  variables: Record<string, SupportedSchema>,
): EnvDefinitionOptions {
  return {
    vars: variables,
  };
}
