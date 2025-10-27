import type { EnvChannel } from "@e-n-v/core";
import type { EnvChannelOptions } from "./EnvChannelOptions";
import type { DotEnvXChannelConfig } from "./channels/dotenvx/DotEnvXChannelConfig";
import { DefaultEnvChannel } from "./channels/default/DefaultEnvChannel";
import { DotEnvXChannel } from "./channels/dotenvx/DotEnvXChannel";

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
    // DotenvX channel
    if ("dotenvx" in options) {
      const config = options as DotEnvXChannelConfig;
      const { dotenvx, get: getOptions = {}, set: setOptions = {} } = config;

      if (!dotenvx) {
        throw new Error("DotEnvX instance is required for dotenvx channel");
      }

      return new DotEnvXChannel(dotenvx, defaultPath, getOptions, setOptions);
    }

    // Named channels (default only at this point)
    if ("name" in options) {
      if (options.name === "default") {
        return new DefaultEnvChannel(defaultPath);
      } else {
        throw new Error(
          `Unknown channel name: ${(options as { name: unknown }).name}`,
        );
      }
    }
  }

  throw new Error(`Invalid channel options: ${options}`);
}
