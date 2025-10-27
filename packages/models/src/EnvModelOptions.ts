import type { SupportedSchema } from "@e-n-v/converters";

/**
 * Custom preprocessing functions to preprocess values before submitting to schema processors.
 * If null or undefined, the preprocessing step is skipped for that type.
 */
export type Preprocessor<T> = (value: string) => T | string;

export interface Preprocessors {
  /**
   * Custom string preprocessing function
   */
  string?: null | undefined | Preprocessor<string>;

  /**
   * Custom number preprocessing function
   */
  number?: null | undefined | Preprocessor<number>;

  /**
   * Custom boolean preprocessing function
   */
  bool?: null | undefined | Preprocessor<boolean>;

  /**
   * Custom enum preprocessing function
   */
  enum?: null | undefined | Preprocessor<string>;
}

/**
 * Options for creating an EnvModel instance
 */
export interface EnvModelOptions {
  /**
   * Environment variable schemas
   * Map of variable names to their schema definitions
   */
  schemas: Record<string, SupportedSchema>;

  /**
   * Preprocessing configuration
   * - `true`: Use default preprocessors for all types
   * - `false`: Disable all preprocessing
   * - Partial object: Customize specific type preprocessors
   */
  preprocess?: true | false | Partial<Preprocessors>;
}
