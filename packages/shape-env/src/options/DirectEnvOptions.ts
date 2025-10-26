import type { Preprocessors } from "@envcredible/core";
import type { SupportedSchema } from "@envcredible/schemata";

/**
 * Options for the load function
 */
export interface DirectEnvOptions {
  /**
   * Source object containing raw environment variable values
   */
  source: Record<string, string>;

  /**
   * Environment variable schemas
   * Map of variable names to their schema definitions
   */
  vars: Record<string, SupportedSchema>;

  /**
   * Custom preprocessing functions to preprocess values before submitting to schema processors.
   * If null or undefined, the preprocessing step is skipped for that type.
   * These functions do not guarantee type casting and can be nullified to skip preprocessing.
   * @default undefined (uses built-in processors)
   * @example { number: (s) => s.replace(/,/g, ''), bool: (s) => s === 'on' ? 'true' : s }
   */
  preprocess?: Preprocessors;

  /**
   * Whether to throw an error when required environment variables are missing
   * @default true
   */
  strict?: boolean;
}
