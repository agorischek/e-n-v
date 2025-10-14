import type { Formatter } from "picocolors/types";
import type { EnvChannelOptions } from "./channels/EnvChannelOptions";
import type { SecretPattern } from "./types";

/**
 * Configuration options for the askEnv function
 */
export type AskEnvOptions = {
  /**
   * Path to the .env file to read from and write to
   * @default ".env"
   * @example ".env.local", ".env.production", "config/.env"
   */
  path?: string;

  /**
   * Channel configuration for reading and writing environment variables.
   * Can be undefined (default), "default", a dotenvx instance, or channel config objects.
   * @default undefined (uses default file-based channel)
   * @example dotenvx, { name: "default" }, { dotenvx: instance, get: {}, set: {} }
   */
  channel?: EnvChannelOptions;

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
  secrets?: Array<SecretPattern>;

  /**
   * Color theme function for styling the CLI interface
   * Uses picocolors formatter functions to customize the primary color scheme
   * @default color.magenta
   * @example color.blue, color.green, color.cyan
   */
  theme?: Formatter;
};