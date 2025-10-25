import type { Formatter } from "picocolors/types";
import type { EnvChannelOptions } from "@envcredible/channels/EnvChannelOptions";
import type { EnvChannel, Preprocessors } from "@envcredible/core";

/**
 * Configuration options for the ask function
 */
export type AskEnvOptions = {
  /**
   * Path to the .env file to read from and write to
   * @default ".env"
   * @example ".env.local", ".env.production", "config/.env"
   */
  path?: string;

  /**
   * Root location used to resolve relative env file paths.
   * Supply CommonJS `__dirname` or ESM `import.meta.url` so the env path resolves next to the caller.
   * Falls back to the current working directory when omitted.
   * @default process.cwd()
   * @example import.meta.url, __dirname
   */
  root?: string;

  /**
   * Channel configuration for reading and writing environment variables.
   * Can be undefined (default), "default", a dotenvx instance, channel config objects, or an EnvChannel instance.
   * @default undefined (uses default file-based channel)
   * @example dotenvx, { name: "default" }, { dotenvx: instance, get: {}, set: {} }, new DefaultEnvChannel(".env")
   */
  channel?: EnvChannelOptions | EnvChannel;

  /**
   * Maximum number of characters to display for values in prompts before truncating
   * Longer values will be shown as "value..." to keep the interface clean
   * @default 40
   * @example 20, 60, 100
   */
  truncate?: number;

  /**
   * Array of patterns (strings or RegExp) used to identify secret environment variables
   * Secret variables will be masked in prompts and can be toggled to reveal/hide
   * @default DEFAULT_SECRET_PATTERNS (includes password, token, api_key, database_url, etc.)
   * @example ["PASSWORD", /secret/i, "API_KEY"], [] (empty array disables masking)
   */
  secrets?: Array<RegExp | string>;

  /**
   * Color theme function for styling the CLI interface
   * Uses picocolors formatter functions to customize the primary color scheme
   * @default color.magenta
   * @example color.blue, color.green, color.cyan
   */
  theme?: Formatter;

  /**
   * Custom preprocessing functions to preprocess values before submitting to schema processors.
   * If null or undefined, the preprocessing step is skipped for that type.
   * These functions do not guarantee type casting and can be nullified to skip preprocessing.
   * @default undefined (uses built-in processors)
   * @example { number: (s) => s.replace(/,/g, ''), bool: (s) => s === 'on' ? 'true' : s }
   */
  preprocess?: Preprocessors;
};
