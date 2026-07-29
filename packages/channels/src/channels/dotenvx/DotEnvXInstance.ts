import type {
  GetOptions,
  SetOptions,
  DotenvConfigOptions,
  DotenvConfigOutput,
} from "@dotenvx/dotenvx";

/**
 * Minimal interface for dotenvx functionality used in ask-env.
 */
export interface DotEnvXInstance {
  get(key: string, options?: GetOptions): Promise<string>;
  set(key: string, value: string, options?: SetOptions): Promise<unknown>;
  config(options?: DotenvConfigOptions): DotenvConfigOutput;
}
