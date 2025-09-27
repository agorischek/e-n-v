import type { DotEnvXInstance } from "./dotenvx/DotEnvXInstance";
import type { DotEnvXChannelConfig } from "./dotenvx/DotEnvXChannelConfig";
import type { DefaultChannelConfig } from "./default/DefaultChannelConfig";

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