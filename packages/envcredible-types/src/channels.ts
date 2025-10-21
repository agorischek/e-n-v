/**
 * Interface for accessing and modifying environment variables
 */
export interface EnvChannel {
  /**
   * Get all environment variables
   */
  get(keys?: string[]): Promise<Record<string, string>>;

  /**
   * Set multiple environment variables
   */
  set(values: Record<string, string>): Promise<void>;
}
