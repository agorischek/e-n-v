/**
 * Interface for accessing and modifying environment variables
 */
export interface EnvChannel {
  /**
   * Get environment variables
   */
  get(keys?: string[]): Promise<Record<string, string>>;

  /**
   * Set environment variables
   */
  set(values: Record<string, string>): Promise<void>;
}
