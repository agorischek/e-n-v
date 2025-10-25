import type { EnvMeta, EnvMetaOptions } from "@envcredible/meta";

/**
 * Define environment variable metadata
 * Creates a reusable configuration for loading and setting up environment variables
 * 
 * @param options - Environment metadata options
 * @returns EnvMeta instance that can be used with load() or setup()
 * 
 * @example
 * ```typescript
 * import define from "e-n-v/define";
 * import { z } from "zod";
 * 
 * export const env = define({
 *   path: ".env",
 *   root: import.meta.url,
 *   vars: {
 *     DATABASE_URL: z.string().url(),
 *     PORT: z.number().min(1024)
 *   }
 * });
 * ```
 */
export function define(options: EnvMetaOptions): EnvMeta {
  const { EnvMeta } = require("@envcredible/meta");
  return new EnvMeta(options);
}

export default define;

// Re-export common schemas for convenience
export * as s from "@envcredible/core";
export { schema } from "@envcredible/core";

// Re-export schema type for imports
export type { SupportedSchema } from "@envcredible/schemata";
