/**
 * Interface for accessing and modifying environment variables
 */
export interface EnvChannel {
  /**
   * Get environment variables, optionally limited to a specific list of keys.
   * @param keys - Optional list of environment variable names to select.
   * @returns Object containing key-value pairs for the requested variables.
   */
  get(): Record<string, string>;
  get<const Keys extends readonly string[]>(keys: Keys): Record<Keys[number], string | undefined>;

  /**
   * Set multiple environment variables
   * @param values - Object containing key-value pairs to set
   */
  set(values: Record<string, string>): void;
}