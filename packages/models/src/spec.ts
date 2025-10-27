import { EnvModel } from "./EnvModel";
import type { EnvModelOptions } from "./EnvModelOptions";
import type { SupportedSchema } from "./types";

/**
 * Create an environment variable specification
 *
 * Sugar utility for creating EnvModel instances with full type inference
 *
 * @param options - Specification options
 * @returns EnvModel instance with inferred types
 *
 * @example
 * ```typescript
 * import { spec, s } from "@e-n-v/models";
 *
 * export default spec({
 *   schemas: {
 *     PORT: s.number({ default: 3000 }),
 *     DATABASE_URL: s.string(),
 *     DEBUG: s.boolean({ default: false })
 *   },
 *   preprocess: true
 * });
 * ```
 */
export function spec<T extends Record<string, SupportedSchema>>(
  options: EnvModelOptions<T>
): EnvModel<T> {
  return new EnvModel<T>(options);
}
