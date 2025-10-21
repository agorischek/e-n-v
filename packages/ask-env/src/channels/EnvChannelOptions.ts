import type { DotEnvXChannelConfig } from "./dotenvx/DotEnvXChannelConfig";
import type { DefaultChannelConfig } from "./default/DefaultChannelConfig";

/**
 * Channel options can be:
 * - undefined (uses default channel)
 * - "default" string (uses default channel)
 * - DotEnvXChannelConfig (uses dotenvx with optional custom options)
 * - DefaultChannelConfig (uses default with custom options)
 */
export type EnvChannelOptions =
  | undefined
  | "default"
  | DotEnvXChannelConfig
  | DefaultChannelConfig;
