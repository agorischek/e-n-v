import { resolveSchemas } from "@envcredible/schemata";
import type { EnvVarSchema } from "@envcredible/core";
import type { EnvSpecOptions, Preprocessors } from "./EnvSpecOptions";

/**
 * Environment variable specification container
 * Encapsulates schemas and preprocessor configuration
 */
export class EnvSpec {
  /**
   * Resolved environment variable schemas
   */
  public readonly schemas: Record<string, EnvVarSchema>;

  /**
   * Preprocessing configuration for environment variable types
   */
  public readonly preprocess: Preprocessors;

  /**
   * Create an EnvSpec instance from options
   * @param options - Specification options
   */
  constructor(options: EnvSpecOptions) {
    // Resolve schemas
    this.schemas = resolveSchemas(options.schemas);

    // Resolve preprocessor configuration
    this.preprocess = this.resolvePreprocessors(options.preprocess);
  }

  /**
   * Resolve preprocessor configuration from options
   * @param config - Preprocessor configuration (true, false, or partial object)
   * @returns Resolved preprocessors object
   */
  private resolvePreprocessors(
    config?: true | false | Partial<Preprocessors>,
  ): Preprocessors {
    if (config === false) {
      // Explicitly disable all preprocessing
      return {
        string: null,
        number: null,
        bool: null,
        enum: null,
      };
    }

    if (config === true || config === undefined) {
      // Use defaults (undefined means use built-in defaults where available)
      return {};
    }

    // Partial configuration - merge with defaults
    return { ...config };
  }
}
