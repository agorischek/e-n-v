import type { EnvMeta } from "@envcredible/meta";
import type { EnvMetaOptions } from "@envcredible/meta";
import type { DirectEnvOptions } from "direct-env";

/**
 * Load and validate environment variables from metadata
 * Does NOT mutate process.env
 * Returns validated and type-safe environment variables
 * 
 * @param meta - EnvMeta instance (from define()) or EnvMetaOptions
 * @param options - Loading options (preprocess, strict mode)
 * @returns Promise resolving to validated environment variables
 * 
 * @example
 * ```typescript
 * import { load } from "e-n-v";
 * import { env } from "./env.meta";
 * 
 * export const { DATABASE_URL, PORT } = await load(env);
 * ```
 */
export async function load<T extends Record<string, any> = Record<string, any>>(
  meta: EnvMeta | EnvMetaOptions,
  options?: DirectEnvOptions
): Promise<T> {
  const { load: directLoad } = await import("direct-env");
  return directLoad<T>(meta, options);
}
