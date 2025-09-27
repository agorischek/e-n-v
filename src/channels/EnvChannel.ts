/**
 * Interface for accessing and modifying environment variables
 */
export interface EnvChannel {
  /**
   * Get the value of an environment variable
   * @param key - The environment variable key
   * @returns The value of the environment variable, or undefined if not found
   */
  get(key: string): string | undefined;

  /**
   * Set the value of an environment variable
   * @param key - The environment variable key
   * @param value - The value to set
   * @returns Promise that resolves when the value has been set
   */
  set(key: string, value: string): Promise<void>;

  /**
   * Set multiple environment variables at once
   * @param values - Object containing key-value pairs to set
   * @returns Promise that resolves when all values have been set
   */
  setMany(values: Record<string, string>): Promise<void>;

  /**
   * Get all environment variables as a key-value object
   * @returns Object containing all environment variables
   */
  getAll(): Record<string, string>;
}