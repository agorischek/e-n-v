import type { EnvVarSchema } from "@e-n-v/core";
import { define } from "@e-n-v/models";
export * from "@e-n-v/schemas"
import type { SupportedSchema } from "@e-n-v/models";


/**
 * Sugar helper for creating environment variable models with predefined schemas
 * 
 * @param schemas - Object containing environment variable schemas
 * @returns EnvModel instance with inferred types
 * 
 * @example
 * ```typescript
 * import vars, { NODE_ENV, PORT } from "@e-n-v/env/vars";
 * 
 * export default vars({ NODE_ENV, PORT });
 * ```
 */
export default function vars<T extends Record<string, SupportedSchema>>(
  schemas: T
): ReturnType<typeof define<T>> {
  return define({ schemas });
}