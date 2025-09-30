/**
 * Interface for accessing and modifying environment variables
 */
export interface EnvChannel {
  /**
   * Get all environment variables
   * @returns Promise that resolves to object containing all environment variable key-value pairs
   */
  get(): Promise<Record<string, string>>;

  /**
   * Set multiple environment variables
   * @param values - Object containing key-value pairs to set
   * @returns Promise that resolves when the values have been set
   */
  set(values: Record<string, string>): Promise<void>;
}