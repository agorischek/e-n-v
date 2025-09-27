import type { EnvChannel } from "./EnvChannel";
import type { ChannelOptions, DotEnvXChannelConfig, DefaultChannelConfig, DotEnvXInstance } from "./types";
import { DefaultEnvChannel } from "./DefaultEnvChannel";
import { DotEnvXChannel } from "./DotEnvXChannel";

/**
 * Create a DotEnvX channel with the given configuration
 */
function createDotEnvXChannel(config: DotEnvXChannelConfig, defaultPath: string): EnvChannel {
  const { dotenvx, get: getOptions = {}, set: setOptions = {} } = config;
  
  if (!dotenvx) {
    throw new Error("DotEnvX instance is required for dotenvx channel");
  }

  return new DotEnvXChannel(dotenvx, defaultPath, getOptions, setOptions);
}

/**
 * Create a default channel with the given configuration
 */
function createDefaultChannel(config: DefaultChannelConfig, defaultPath: string): EnvChannel {
  return new DefaultEnvChannel(defaultPath);
}

/**
 * Resolve channel options into an EnvChannel instance
 * @param options - The channel options to resolve
 * @param defaultPath - Default path to use for env files (default: ".env")
 * @returns An EnvChannel instance
 */
export function resolveChannel(options: ChannelOptions, defaultPath = ".env"): EnvChannel {
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
        return createDefaultChannel(options as DefaultChannelConfig, defaultPath);
      } else {
        throw new Error(`Unknown channel name: ${(options as { name: unknown }).name}`);
      }
    }
  }

  // Assume it's a dotenvx singleton import
  if (typeof options === "object" && options !== null && typeof options.get === "function" && typeof options.set === "function") {
    return new DotEnvXChannel(options as DotEnvXInstance, defaultPath, {}, {});
  }

  throw new Error(`Invalid channel options: ${options}`);
}