import type { EnvChannelOptions } from "@envcredible/channels";
import type { SupportedSchema } from "@envcredible/schemata";

/**
 * Options for creating an EnvMeta instance
 */
export interface EnvMetaOptions {
  /**
   * Relative or absolute path to the env file
   * @example ".env", ".env.local", "config/.env"
   */
  path: string;

  /**
   * Root location used to resolve relative env file paths.
   * Supply CommonJS `__dirname` or ESM `import.meta.url` so the env path resolves next to the caller.
   * Falls back to the current working directory when omitted.
   * @example import.meta.url, __dirname
   */
  root?: string | URL;

  /**
   * Environment variable schemas
   * Map of variable names to their schema definitions
   */
  vars: Record<string, SupportedSchema>;

  /**
   * Channel configuration for reading and writing environment variables.
   * Can be undefined (default), "default", a dotenvx instance, or channel config objects.
   * @default undefined (uses default file-based channel)
   */
  channel?: EnvChannelOptions;
}
