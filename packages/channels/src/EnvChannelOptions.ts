import type { DotEnvXChannelConfig } from "./channels/dotenvx/DotEnvXChannelConfig";
import type { DefaultChannelConfig } from "./channels/default/DefaultChannelConfig";
import type { ProcessEnvChannelConfig, ProcessChannelConfig } from "./channels/processenv/ProcessEnvChannelConfig";

/**
 * Channel options can be:
 * - undefined (uses default channel)
 * - "default" string (uses default channel)
 * - "processenv" string (uses process.env channel)
 * - dotenvx instance (uses dotenvx with default options)
 * - DotEnvXChannelConfig (uses dotenvx with custom options)
 * - DefaultChannelConfig (uses default with custom options)
 * - ProcessEnvChannelConfig (uses process.env with config options)
 * - ProcessChannelConfig (uses process.env with { process } notation)
 */
export type EnvChannelOptions =
  | undefined
  | "default"
  | "processenv"
  | DotEnvXChannelConfig
  | DefaultChannelConfig
  | ProcessEnvChannelConfig
  | ProcessChannelConfig;
