import type { GetOptions, SetOptions, DotenvConfigOptions, DotenvConfigOutput } from "@dotenvx/dotenvx";

/**
 * Minimal interface for dotenvx functionality that we require
 */
export interface DotEnvXInstance {
  get(key: string, options?: GetOptions): string;
  set(key: string, value: string, options?: SetOptions): unknown;
  config(options?: DotenvConfigOptions): DotenvConfigOutput;
}