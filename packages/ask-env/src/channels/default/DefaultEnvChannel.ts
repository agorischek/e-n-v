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
   * Get all environment variables
   * @returns Promise that resolves to object containing all environment variable key-value pairs
   */
  async get(): Promise<Record<string, string>> {
    return await this.envSource.read();
  }

  /**
   * Set multiple environment variables
   * @param values - Object containing key-value pairs to set
   * @returns Promise that resolves when the values have been set
   */
  async set(values: Record<string, string>): Promise<void> {
    await this.envSource.write(values);
  }
}