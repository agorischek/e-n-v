import { EnvModel } from "./EnvModel";
import type { EnvModelOptions } from "./EnvModelOptions";

/**
 * Create an environment variable specification
 *
 * Sugar utility for creating EnvModel instances
 *
 * @param options - Specification options
 * @returns EnvModel instance
 *
 * @example
 * ```typescript
 * import { spec } from "models";
 * import { z } from "zod";
 *
 * export default spec({
 *   schemas: {
 *     PORT: z.number(),
 *     DATABASE_URL: z.string().url(),
 *     DEBUG: z.boolean()
 *   },
 *   preprocess: true
 * });
 * ```
 */
export function spec(options: EnvModelOptions): EnvModel {
  return new EnvModel(options);
}
