import type { EnvChannel } from "./EnvChannel";
import type { GetOptions, SetOptions, DotenvConfigOptions, DotenvConfigOutput } from "@dotenvx/dotenvx";

/**
 * Minimal interface for dotenvx functionality that we require
 */
export interface DotEnvXInstance {
  get(key: string, options?: GetOptions): string;
  set(key: string, value: string, options?: SetOptions): any;
  config(options?: DotenvConfigOptions): DotenvConfigOutput;
}

/**
 * DotEnvX channel configuration
 */
export interface DotEnvXChannelConfig {
  dotenvx: DotEnvXInstance;
  get?: GetOptions & { [key: string]: any };
  set?: SetOptions & { [key: string]: any };
}

/**
 * Default channel configuration
 */
export interface DefaultChannelConfig {
  name: "default";
  // Future options can be added here
}

/**
 * Channel options can be:
 * - undefined (uses default channel)
 * - "default" string (uses default channel) 
 * - dotenvx instance (uses dotenvx with default options)
 * - DotEnvXChannelConfig (uses dotenvx with custom options)
 * - DefaultChannelConfig (uses default with custom options)
 */
export type ChannelOptions = 
  | undefined 
  | "default"
  | DotEnvXInstance // dotenvx singleton import
  | DotEnvXChannelConfig 
  | DefaultChannelConfig;