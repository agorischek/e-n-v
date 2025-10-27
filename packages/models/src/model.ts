import { EnvModel } from "./EnvModel";
import type { EnvModelOptions } from "./EnvModelOptions";
import type { SupportedSchema } from "./types";

/**
 * Create an environment variable model
 *
 * Sugar utility for creating EnvModel instances with full type inference
 *
 * @param options - Model options
 * @returns EnvModel instance with inferred types
 *
 * @example
 * ```typescript
 * import { define, s } from "@e-n-v/models";
 *
 * export default define({
 *   schemas: {
 *     PORT: s.number({ default: 3000 }),
 *     DATABASE_URL: s.string(),
 *     DEBUG: s.boolean({ default: false })
 *   },
 *   preprocess: true
 * });
 * ```
 */
export function define<T extends Record<string, SupportedSchema>>(
  options: EnvModelOptions<T>
): EnvModel<T> {
  return new EnvModel<T>(options);
}