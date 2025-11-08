import type { BooleanPreprocessorOptions, Preprocessor } from "@e-n-v/core";
import type { SecretPattern } from "./secrets";
import type { SupportedSchema } from "./types";

type PreprocessorToggle<T> = Preprocessor<T> | boolean | undefined;

export interface Preprocessors {
  /**
   * Custom string preprocessing function
   */
  string?: PreprocessorToggle<string>;

  /**
   * Custom number preprocessing function
   */
  number?: PreprocessorToggle<number>;

  /**
   * Custom boolean preprocessing function
   */
  boolean?:
    | boolean
    | Preprocessor<boolean>
    | BooleanPreprocessorOptions
    | undefined;

  /**
   * Custom enum preprocessing function
   */
  enum?: PreprocessorToggle<string>;
}

/**
 * Options for creating an EnvModel instance
 */
export interface EnvModelOptions<
  T extends Record<string, SupportedSchema> = Record<string, SupportedSchema>,
> {
  /**
   * Environment variable schemas
   * Map of variable names to their schema definitions
   */
  schemas: T;

  /**
   * Preprocessing configuration
   * - `true`: Use default preprocessors for all types
   * - `false`: Disable all preprocessing
   * - Partial object: Customize specific type preprocessors
   */
  preprocess?: true | false | Partial<Preprocessors>;

  /**
   * Patterns used to identify secret environment variables
   * Secrets are masked in interactive prompts and sanitized in error messages
   * Provide an empty array to disable automatic secret detection
   */
  secrets?: ReadonlyArray<SecretPattern>;
}
