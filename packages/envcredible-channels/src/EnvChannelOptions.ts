import type { DotEnvXChannelConfig } from "./channels/dotenvx/DotEnvXChannelConfig";
import type { DefaultChannelConfig } from "./channels/default/DefaultChannelConfig";
import type { ProcessChannelConfig } from "./channels/process/ProcessChannelConfig";
import type { AggregateChannelConfig } from "./channels/aggregate/AggregateChannelConfig";

/**
 * Channel options can be:
 * - undefined (uses default channel)
 * - "default" string (uses default channel)
 * - dotenvx instance (uses dotenvx with default options)
 * - DotEnvXChannelConfig (uses dotenvx with custom options)
 * - DefaultChannelConfig (uses default with custom options)
 * - ProcessChannelConfig (uses process.env)
 * - AggregateChannelConfig (combines multiple channels)
 * - Array of EnvChannelOptions (shorthand for aggregate with overwrite=true)
 */
export type EnvChannelOptions =
  | undefined
  | "default"
  | DotEnvXChannelConfig
  | DefaultChannelConfig
  | ProcessChannelConfig
  | AggregateChannelConfig
  | EnvChannelOptions[];
