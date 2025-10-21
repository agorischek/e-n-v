import type { EnvChannel } from "@envcredible/types";
import type { EnvChannelOptions } from "./EnvChannelOptions";
import type { DotEnvXChannelConfig } from "./channels/dotenvx/DotEnvXChannelConfig";
import type { DefaultChannelConfig } from "./channels/default/DefaultChannelConfig";
import type { DotEnvXInstance } from "./channels/dotenvx/DotEnvXInstance";
import { DefaultEnvChannel } from "./channels/default/DefaultEnvChannel";
import { DotEnvXChannel } from "./channels/dotenvx/DotEnvXChannel";

/**
 * Create a DotEnvX channel with the given configuration
 */
function createDotEnvXChannel(
  config: DotEnvXChannelConfig,
  defaultPath: string,
): EnvChannel {
  const { dotenvx, get: getOptions = {}, set: setOptions = {} } = config;

  if (!dotenvx) {
    throw new Error("DotEnvX instance is required for dotenvx channel");
  }

  return new DotEnvXChannel(dotenvx, defaultPath, getOptions, setOptions);
}

/**
 * Create a default channel with the given configuration
 */
function createDefaultChannel(
  config: DefaultChannelConfig,
  defaultPath: string,
): EnvChannel {
  return new DefaultEnvChannel(defaultPath);
}

/**
 * Resolve channel options into an EnvChannel instance
 * @param options - The channel options to resolve
 * @param defaultPath - Default path to use for env files (default: ".env")
 * @returns An EnvChannel instance
 */
export function resolveChannel(
  options: EnvChannelOptions,
  defaultPath = ".env",
): EnvChannel {
  // undefined or "default" string -> use default channel
  if (options === undefined || options === "default") {
    return new DefaultEnvChannel(defaultPath);
  }

  // Check if it's a configuration object
  if (typeof options === "object" && options !== null) {
    if ("dotenvx" in options) {
      return createDotEnvXChannel(options as DotEnvXChannelConfig, defaultPath);
    } else if ("name" in options) {
      if (options.name === "default") {
        return createDefaultChannel(
          options as DefaultChannelConfig,
          defaultPath,
        );
      } else {
        throw new Error(
          `Unknown channel name: ${(options as { name: unknown }).name}`,
        );
      }
    }
  }

  throw new Error(`Invalid channel options: ${options}`);
}
