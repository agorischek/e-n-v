import type { EnvMeta } from "./meta/EnvMeta";
import type { EnvMetaOptions } from "./meta/EnvMetaOptions";
import { EnvMeta as EnvMetaClass } from "./meta/EnvMeta";
import type { Preprocessors } from "@envcredible/core";

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
  options?: { preprocess?: Preprocessors; strict?: boolean },
): Promise<T> {
  // Normalize to EnvMeta instance
  const envMeta = meta instanceof EnvMetaClass ? meta : new EnvMetaClass(meta);

  // Get values from channel
  const source = await envMeta.channel.get();

  // Import and call shape-env parse
  const { parse } = await import("shape-env");
  return parse<T>({
    source,
    vars: Object.fromEntries(
      Object.entries(envMeta.schemas).map(([key, schema]) => [key, schema]),
    ),
    preprocess: options?.preprocess ?? envMeta.preprocess,
    strict: options?.strict,
  });
}
