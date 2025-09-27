import { EnvAccessor } from "../types/EnvAccessor";
import { updateEnvValue, updateEnvValues } from "../io/updateEnv";
import { loadEnvFromFile } from "../io/loadEnv";
import { writeEnvToFile } from "../io/writeEnv";
import { existsSync } from "fs";

/**
 * Default implementation of EnvAccessor that works with .env files
 */
export class DefaultEnvAccessor implements EnvAccessor {
  private filePath: string;
  private cachedValues?: Record<string, string>;

  /**
   * Create a new DefaultEnvAccessor
   * @param filePath - Path to the .env file to manage
   */
  constructor(filePath: string) {
    this.filePath = filePath;
  }

  /**
   * Get the value of an environment variable
   * @param key - The environment variable key
   * @returns The value of the environment variable, or undefined if not found
   */
  get(key: string): string | undefined {
    this.ensureLoaded();
    return this.cachedValues?.[key];
  }

  /**
   * Set the value of an environment variable
   * @param key - The environment variable key
   * @param value - The value to set
   * @returns Promise that resolves when the value has been set
   */
  async set(key: string, value: string): Promise<void> {
    this.ensureFileExists();
    updateEnvValue(this.filePath, key, value);
    // Update cache
    this.ensureLoaded();
    if (this.cachedValues) {
      this.cachedValues[key] = value;
    }
  }

  /**
   * Set multiple environment variables at once
   * @param values - Object containing key-value pairs to set
   * @returns Promise that resolves when all values have been set
   */
  async setMany(values: Record<string, string>): Promise<void> {
    this.ensureFileExists();
    updateEnvValues(this.filePath, values);
    // Update cache
    this.ensureLoaded();
    if (this.cachedValues) {
      Object.assign(this.cachedValues, values);
    }
  }

  /**
   * Get all environment variables as a key-value object
   * @returns Object containing all environment variables
   */
  getAll(): Record<string, string> {
    this.ensureLoaded();
    return this.cachedValues ? { ...this.cachedValues } : {};
  }

  /**
   * Clear the cache to force reload on next access
   */
  clearCache(): void {
    this.cachedValues = undefined;
  }

  /**
   * Ensure the cached values are loaded from file
   */
  private ensureLoaded(): void {
    if (this.cachedValues === undefined) {
      this.cachedValues = loadEnvFromFile(this.filePath);
    }
  }

  /**
   * Ensure the .env file exists, create empty one if it doesn't
   */
  private ensureFileExists(): void {
    if (!existsSync(this.filePath)) {
      writeEnvToFile({}, this.filePath);
    }
  }
}