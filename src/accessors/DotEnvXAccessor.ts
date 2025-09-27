import { EnvAccessor } from "../types/EnvAccessor";
import dotenvx from "@dotenvx/dotenvx";
import { existsSync, writeFileSync } from "fs";

/**
 * Options for configuring DotEnvXAccessor
 */
export interface DotEnvXAccessorOptions {
  /**
   * Specify a custom path if your file containing environment variables is located elsewhere.
   * @default ".env"
   */
  path?: string | string[];

  /**
   * Specify the encoding of your file containing environment variables.
   * @default 'utf8'
   */
  encoding?: string;

  /**
   * Override any environment variables that have already been set on your machine with values from your .env file.
   * @default false
   */
  overload?: boolean;

  /**
   * Turn on logging to help debug why certain keys or values are not being set as you expect.
   * @default false
   */
  debug?: boolean;

  /**
   * Specify whether variables should be encrypted when set
   * @default false
   */
  encrypt?: boolean;

  /**
   * Customize the path to your .env.keys file. This is useful with monorepos.
   */
  envKeysFile?: string;

  /**
   * Load a .env convention (available conventions: 'nextjs', 'flow')
   */
  convention?: string;

  /**
   * Suppress specific errors like MISSING_ENV_FILE.
   * @default []
   */
  ignore?: string[];

  /**
   * Throw immediately if an error is encountered - like a missing .env file.
   * @default false
   */
  strict?: boolean;
}

/**
 * DotEnvX implementation of EnvAccessor that uses @dotenvx/dotenvx library
 */
export class DotEnvXAccessor implements EnvAccessor {
  private options: DotEnvXAccessorOptions;
  private cachedValues?: Record<string, string>;
  private primaryPath: string;

  /**
   * Create a new DotEnvXAccessor
   * @param options - Configuration options for dotenvx
   */
  constructor(options: DotEnvXAccessorOptions = {}) {
    this.options = {
      path: ".env",
      encoding: "utf8",
      overload: false,
      debug: false,
      encrypt: false,
      ignore: [],
      strict: false,
      ...options
    };
    
    // Determine the primary path for file operations
    this.primaryPath = Array.isArray(this.options.path) 
      ? this.options.path[0] 
      : (this.options.path || ".env");
  }

  /**
   * Get the value of an environment variable
   * @param key - The environment variable key
   * @returns The value of the environment variable, or undefined if not found
   */
  get(key: string): string | undefined {
    try {
      const value = dotenvx.get(key, {
        ignore: this.options.ignore,
        overload: this.options.overload,
        envKeysFile: this.options.envKeysFile,
        strict: false // We want to return undefined instead of throwing
      });
      
      // dotenvx.get returns empty string for missing keys, we want undefined
      return value === "" ? undefined : value;
    } catch {
      // If there's an error (e.g., missing file), return undefined
      return undefined;
    }
  }

  /**
   * Set the value of an environment variable
   * @param key - The environment variable key
   * @param value - The value to set
   * @returns Promise that resolves when the value has been set
   */
  async set(key: string, value: string): Promise<void> {
    this.ensureFileExists();
    
    try {
      dotenvx.set(key, value, {
        path: this.primaryPath,
        encrypt: this.options.encrypt,
        envKeysFile: this.options.envKeysFile,
        convention: this.options.convention
      });
      
      // Clear cache to force reload
      this.clearCache();
    } catch (error) {
      throw new Error(`Failed to set environment variable ${key}: ${error}`);
    }
  }

  /**
   * Set multiple environment variables at once
   * @param values - Object containing key-value pairs to set
   * @returns Promise that resolves when all values have been set
   */
  async setMany(values: Record<string, string>): Promise<void> {
    this.ensureFileExists();
    
    try {
      // Set each value individually since dotenvx.set only handles one at a time
      for (const [key, value] of Object.entries(values)) {
        dotenvx.set(key, value, {
          path: this.primaryPath,
          encrypt: this.options.encrypt,
          envKeysFile: this.options.envKeysFile,
          convention: this.options.convention
        });
      }
      
      // Clear cache to force reload
      this.clearCache();
    } catch (error) {
      throw new Error(`Failed to set environment variables: ${error}`);
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
   * Load environment variables using dotenvx config
   */
  private ensureLoaded(): void {
    if (this.cachedValues === undefined) {
      try {
        const result = dotenvx.config({
          path: this.options.path,
          encoding: this.options.encoding,
          overload: this.options.overload,
          debug: this.options.debug,
          ignore: this.options.ignore,
          strict: false, // Don't throw on missing files
          envKeysFile: this.options.envKeysFile,
          convention: this.options.convention,
          processEnv: {} // Don't modify process.env, just parse
        });
        
        this.cachedValues = result.parsed || {};
      } catch {
        // If config fails, return empty object
        this.cachedValues = {};
      }
    }
  }

  /**
   * Ensure the .env file exists, create empty one if it doesn't
   */
  private ensureFileExists(): void {
    if (!existsSync(this.primaryPath)) {
      // Create empty .env file
      writeFileSync(this.primaryPath, "", "utf8");
    }
  }

  /**
   * Get the current configuration options
   * @returns Current DotEnvXAccessor options
   */
  getOptions(): Readonly<DotEnvXAccessorOptions> {
    return { ...this.options };
  }

  /**
   * Get the primary file path being used
   * @returns The primary .env file path
   */
  getPrimaryPath(): string {
    return this.primaryPath;
  }
}