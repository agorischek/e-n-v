import type { EnvChannel } from "@e-n-v/core";
import type { EnvChannelOptions } from "./EnvChannelOptions";
import type { DotEnvChannelConfig } from "./channels/dotenv/DotEnvChannelConfig";
import type { DotEnvXChannelConfig } from "./channels/dotenvx/DotEnvXChannelConfig";
import { DefaultEnvChannel } from "./channels/default/DefaultEnvChannel";
import { DotEnvChannel } from "./channels/dotenv/DotEnvChannel";
import { DotEnvXChannel } from "./channels/dotenvx/DotEnvXChannel";
import { ProcessEnvChannel } from "./channels/processenv/ProcessEnvChannel";

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

  // "processenv" string -> use process.env channel
  if (options === "processenv") {
    return new ProcessEnvChannel();
  }

  // Check if it's a configuration object
  if (typeof options === "object" && options !== null) {
    // Dotenv channel
    if ("dotenv" in options) {
      const config = options as DotEnvChannelConfig;
      const {
        dotenv,
        get: getOptions = {},
        parse: parseOptions = {},
        path,
      } = config;

      if (!dotenv) {
        throw new Error("Dotenv instance is required for dotenv channel");
      }

      const resolvedPath = path ?? defaultPath;
      const mergedGetOptions = { ...getOptions };
      if (typeof mergedGetOptions.path !== "string") {
        mergedGetOptions.path = resolvedPath;
      }

      return new DotEnvChannel(
        dotenv,
        resolvedPath,
        mergedGetOptions,
        parseOptions ?? {},
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

    // Process channel with { process } notation
    if ("process" in options) {
      // Verify it's the actual process object (has env property)
      if (
        options.process &&
        typeof options.process === "object" &&
        "env" in options.process
      ) {
        return new ProcessEnvChannel();
      }
      throw new Error("Invalid process object provided to channel config");
    }

    // Named channels
    if ("name" in options) {
      if (options.name === "default") {
        return new DefaultEnvChannel(defaultPath);
      } else if (options.name === "processenv") {
        return new ProcessEnvChannel();
      } else {
        throw new Error(
          `Unknown channel name: ${(options as { name: unknown }).name}`,
        );
      }
    }
  }

  throw new Error(`Invalid channel options: ${options}`);
}
