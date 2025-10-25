import type { EnvChannel } from "../../EnvChannel";
import type { EnvChannelOptions } from "../../EnvChannelOptions";
import { resolveChannel } from "../../resolveChannel";

/**
 * Channel that aggregates multiple channels
 * Can combine values from multiple sources (files, process.env, etc.)
 */
export class AggregateEnvChannel implements EnvChannel {
  private channels: EnvChannel[];
  private overwrite: boolean;

  /**
   * Create a new AggregateEnvChannel
   * @param channelConfigs - Array of channel configurations to aggregate
   * @param overwrite - Whether later channels override earlier ones (default: true)
   */
  constructor(channelConfigs: EnvChannelOptions[], overwrite = true) {
    if (!Array.isArray(channelConfigs) || channelConfigs.length === 0) {
      throw new Error("AggregateEnvChannel requires at least one channel configuration");
    }

    this.channels = channelConfigs.map((config) => resolveChannel(config));
    this.overwrite = overwrite;
  }

  /**
   * Get environment variables from all channels
   * If overwrite is true, later channels override earlier ones
   * If overwrite is false, earlier channels take precedence
   * @returns Promise that resolves to combined environment variables
   */
  async get(): Promise<Record<string, string>> {
    const result: Record<string, string> = {};

    // Process channels in order
    for (const channel of this.channels) {
      const values = await channel.get();
      
      if (this.overwrite) {
        // Later channels overwrite earlier ones
        Object.assign(result, values);
      } else {
        // Earlier channels take precedence
        for (const [key, value] of Object.entries(values)) {
          if (!(key in result)) {
            result[key] = value;
          }
        }
      }
    }

    return result;
  }

  /**
   * Set environment variables to all channels
   * WARNING: This will write to ALL channels in the aggregate
   * @param values - Object containing key-value pairs to set
   * @returns Promise that resolves when all channels have been updated
   */
  async set(values: Record<string, string>): Promise<void> {
    // Write to all channels
    await Promise.all(
      this.channels.map((channel) => channel.set(values))
    );
  }
}
