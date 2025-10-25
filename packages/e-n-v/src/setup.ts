import type { EnvMeta } from "@envcredible/meta";
import type { AskEnvOptions } from "ask-env";

/**
 * Interactive setup for environment variables
 * Prompts user to configure missing or invalid environment variables
 * Writes values to the configured channel (typically .env file)
 * 
 * @param meta - EnvMeta instance (from define())
 * @param options - Setup options (theme, secrets, truncate, etc.)
 * @returns Promise that resolves when setup is complete
 * 
 * @example
 * ```typescript
 * import { setup } from "e-n-v";
 * import { env } from "./env.meta";
 * 
 * await setup(env, {
 *   theme: color.cyan,
 *   secrets: ["API_KEY", "DATABASE_URL"]
 * });
 * ```
 */
export async function setup(
  meta: EnvMeta,
  options?: Omit<AskEnvOptions, "path" | "root" | "channel">
): Promise<void> {
  const { ask } = await import("ask-env");
  
  // Extract schemas from meta
  const schemas: Record<string, any> = {};
  for (const [key, schema] of Object.entries(meta.schemas)) {
    schemas[key] = schema;
  }

  await ask(schemas, {
    ...options,
    path: meta.path,
    channel: meta.channel,
    preprocess: options?.preprocess ?? meta.preprocess,
  });
}
