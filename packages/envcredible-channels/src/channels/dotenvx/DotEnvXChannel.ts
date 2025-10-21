import type { EnvChannel } from "@envcredible/types";
import type { DotEnvXGetOptions } from "./DotEnvXGetOptions";
import type { DotEnvXSetOptions } from "./DotEnvXSetOptions";
import type { DotEnvXInstance } from "./DotEnvXInstance";
import { existsSync, writeFileSync } from "fs";

/**
 * Simple DotEnvX implementation of EnvChannel that wraps @dotenvx/dotenvx library
 * This is just an API mapping wrapper without caching or complex state management
 */
export class DotEnvXChannel implements EnvChannel {
  private dotenvx: DotEnvXInstance;
  private getOptions: DotEnvXGetOptions;
  private setOptions: DotEnvXSetOptions;
  private defaultPath: string;

  /**
   * Create a new DotEnvXChannel
   * @param dotenvx - The dotenvx instance to use
   * @param defaultPath - Default path for env files
   * @param getOptions - Options for get operations
   * @param setOptions - Options for set operations
   */
  constructor(
    dotenvx: DotEnvXInstance,
    defaultPath: string = ".env",
    getOptions: DotEnvXGetOptions = {},
    setOptions: DotEnvXSetOptions = {},
  ) {
    this.dotenvx = dotenvx;
    this.defaultPath = defaultPath;
    this.getOptions = getOptions;
    this.setOptions = setOptions;
  }

  /**
   * Get all environment variables
   * @returns Promise that resolves to object containing all environment variable key-value pairs
   */
  async get(): Promise<Record<string, string>> {
    try {
      // Use config with a placeholder object to avoid mutating process.env
      const myEnv = {};
      const result = this.dotenvx.config({
        processEnv: myEnv,
        quiet: true,
        ignore: ["MISSING_ENV_FILE"],
        path: this.defaultPath,
        ...this.getOptions,
      });

      return result.parsed || {};
    } catch {
      // If there's an error (e.g., missing file), return empty object
      return {};
    }
  }

  /**
   * Set multiple environment variables
   * @param values - Object containing key-value pairs to set
   * @returns Promise that resolves when the values have been set
   */
  async set(values: Record<string, string>): Promise<void> {
    // Ensure the file exists
    if (!existsSync(this.defaultPath)) {
      writeFileSync(this.defaultPath, "", "utf8");
    }

    try {
      const options = {
        path: this.defaultPath,
        ...this.setOptions,
      };

      // Set each key-value pair
      for (const [key, value] of Object.entries(values)) {
        this.dotenvx.set(key, value, options);
      }
    } catch (error) {
      throw new Error(`Failed to set environment variables: ${error}`);
    }
  }

  /**
   * Get the primary path being used for env files
   * @returns The primary path
   */
  getPrimaryPath(): string {
    return this.defaultPath;
  }

  /**
   * Clear any cached data (no-op for this implementation since we don't cache)
   */
  clearCache(): void {
    // No-op: This implementation doesn't use caching
  }
}
