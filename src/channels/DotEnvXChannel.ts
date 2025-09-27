import { EnvChannel } from "./EnvChannel";
import type { GetOptions, SetOptions } from "@dotenvx/dotenvx";
import type { DotEnvXInstance } from "./types";
import { existsSync, writeFileSync } from "fs";

/**
 * Simple DotEnvX implementation of EnvChannel that wraps @dotenvx/dotenvx library
 * This is just an API mapping wrapper without caching or complex state management
 */
export class DotEnvXChannel implements EnvChannel {
  private dotenvx: DotEnvXInstance;
  private getOptions: GetOptions;
  private setOptions: SetOptions;
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
    getOptions: GetOptions = {},
    setOptions: SetOptions = {}
  ) {
    this.dotenvx = dotenvx;
    this.defaultPath = defaultPath;
    this.getOptions = getOptions;
    this.setOptions = setOptions;
  }

  /**
   * Get the value of an environment variable
   * @param key - The environment variable key
   * @returns The value of the environment variable, or undefined if not found
   */
  get(key: string): string | undefined {
    try {
      // Use config with a placeholder object to avoid mutating process.env
      const myEnv = {};
      const result = this.dotenvx.config({
        processEnv: myEnv,
        quiet: true,
        path: this.defaultPath,
        ...this.getOptions
      });
      
      if (result.parsed && result.parsed[key]) {
        return result.parsed[key];
      }
      
      return undefined;
    } catch {
      // If there's an error (e.g., missing file), return undefined
      return undefined;
    }
  }

  /**
   * Set the value of an environment variable
   * @param key - The environment variable key
   * @param value - The value to set
   * @returns Promise that resolves when the value has been set
   */
  async set(key: string, value: string): Promise<void> {
    // Ensure the file exists
    if (!existsSync(this.defaultPath)) {
      writeFileSync(this.defaultPath, "", "utf8");
    }
    
    try {
      const options = {
        path: this.defaultPath,
        ...this.setOptions
      };
      
      this.dotenvx.set(key, value, options);
    } catch (error) {
      throw new Error(`Failed to set environment variable ${key}: ${error}`);
    }
  }
}