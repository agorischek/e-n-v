import type { EnvChannel } from "@e-n-v/core";

/**
 * EnvChannel implementation that works with process.env
 * This channel reads from and writes to the current process environment
 */
export class ProcessEnvChannel implements EnvChannel {
  /**
   * Get all environment variables from process.env
   * @returns Promise that resolves to object containing all environment variable key-value pairs
   */
  async get(): Promise<Record<string, string>> {
    // Filter out undefined values and convert to string
    const env: Record<string, string> = {};
    for (const [key, value] of Object.entries(process.env)) {
      if (value !== undefined) {
        env[key] = value;
      }
    }
    return env;
  }

  /**
   * Set multiple environment variables in process.env
   * @param values - Object containing key-value pairs to set
   * @returns Promise that resolves when the values have been set
   */
  async set(values: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(values)) {
      process.env[key] = value;
    }
  }
}