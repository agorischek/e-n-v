import { EnvSpec } from "./EnvSpec";
import type { EnvSpecOptions } from "./EnvSpecOptions";

/**
 * Create an environment variable specification
 *
 * Sugar utility for creating EnvSpec instances
 *
 * @param options - Specification options
 * @returns EnvSpec instance
 *
 * @example
 * ```typescript
 * import { spec } from "@envcredible/specification";
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
export function spec(options: EnvSpecOptions): EnvSpec {
  return new EnvSpec(options);
}
