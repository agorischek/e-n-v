import type { EnvChannelOptions } from "../../EnvChannelOptions";

/**
 * Configuration for the aggregate channel
 * Combines multiple channels into one
 */
export interface AggregateChannelConfig {
  /**
   * Array of channel configurations to aggregate
   * Values from later channels override earlier ones if overwrite is true
   */
  aggregate: EnvChannelOptions[];

  /**
   * Whether later channels should overwrite values from earlier channels
   * @default true
   */
  overwrite?: boolean;
}
