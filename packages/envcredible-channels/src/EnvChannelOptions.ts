import type { DotEnvXChannelConfig } from "./channels/dotenvx/DotEnvXChannelConfig";
import type { DefaultChannelConfig } from "./channels/default/DefaultChannelConfig";

/**
 * Channel options can be:
 * - undefined (uses default channel)
 * - "default" string (uses default channel)
 * - dotenvx instance (uses dotenvx with default options)
 * - DotEnvXChannelConfig (uses dotenvx with custom options)
 * - DefaultChannelConfig (uses default with custom options)
 */
export type EnvChannelOptions =
  | undefined
  | "default"
  | DotEnvXChannelConfig
  | DefaultChannelConfig;
