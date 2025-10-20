import type { EnvChannel } from "../EnvChannel";
import { EnvSource } from "../../../../envrw/src/index";

/**
 * Default implementation of EnvChannel that works with .env files using envrw
 */
export class DefaultEnvChannel implements EnvChannel {
  private envSource: EnvSource;

  /**
   * Create a new DefaultEnvChannel
   * @param filePath - Path to the .env file to manage
   */
  constructor(filePath: string) {
    this.envSource = new EnvSource(filePath);
  }

  /**
   * Get environment variables, optionally selecting a subset of keys.
   * @param keys - Optional list of keys to read; returns all variables when omitted.
   */
  get(): Record<string, string>;
  get<const Keys extends readonly string[]>(keys: Keys): Record<Keys[number], string | undefined>;
  get(keys?: readonly string[]): Record<string, string | undefined> {
    if (!keys) {
      return this.envSource.readSync();
    }

    return this.envSource.readSync(keys);
  }

  /**
   * Set multiple environment variables
   * @param values - Object containing key-value pairs to set
   * @returns Promise that resolves when the values have been set
   */
  set(values: Record<string, string>): void {
    this.envSource.writeSync(values);
  }
}
