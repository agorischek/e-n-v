import type { EnvChannel } from "@envcredible/core";
import type { EnvChannelOptions } from "./EnvChannelOptions";
import type { DotEnvXChannelConfig } from "./channels/dotenvx/DotEnvXChannelConfig";
import type { ProcessChannelConfig } from "./channels/process/ProcessChannelConfig";
import type { AggregateChannelConfig } from "./channels/aggregate/AggregateChannelConfig";
import { DefaultEnvChannel } from "./channels/default/DefaultEnvChannel";
import { DotEnvXChannel } from "./channels/dotenvx/DotEnvXChannel";
import { ProcessEnvChannel } from "./channels/process/ProcessEnvChannel";
import { AggregateEnvChannel } from "./channels/aggregate/AggregateEnvChannel";

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

  // Array of configs -> aggregate channel with overwrite=true
  if (Array.isArray(options)) {
    return new AggregateEnvChannel(options, true);
  }

  // Check if it's a configuration object
  if (typeof options === "object" && options !== null) {
    // Aggregate channel
    if ("aggregate" in options) {
      const config = options as AggregateChannelConfig;
      return new AggregateEnvChannel(
        config.aggregate,
        config.overwrite ?? true
      );
    }
    
    // DotenvX channel
    if ("dotenvx" in options) {
      const config = options as DotEnvXChannelConfig;
      const { dotenvx, get: getOptions = {}, set: setOptions = {} } = config;

      if (!dotenvx) {
        throw new Error("DotEnvX instance is required for dotenvx channel");
      }

      return new DotEnvXChannel(dotenvx, defaultPath, getOptions, setOptions);
    } 
    
    // Process channel - shorthand { process } or { name: "process" }
    if ("process" in options || ("name" in options && options.name === "process")) {
      const config = options as ProcessChannelConfig;
      return new ProcessEnvChannel(config.process);
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
