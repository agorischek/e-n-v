import { type EnvVarSchema } from "@e-n-v/core";
import type { EnvModelOptions, Preprocessors } from "./EnvModelOptions";
import { resolveSecretPatterns, shouldTreatAsSecret, type SecretPatterns } from "./secrets";
import type { SupportedSchema } from "./types";
import { resolveSchemas } from "./resolve";

/**
 * Environment variable specification container
 * Encapsulates schemas and preprocessor configuration
 */
export class EnvModel<
  T extends Record<string, SupportedSchema> = Record<string, SupportedSchema>,
> {
  /**
   * Resolved environment variable schemas
   */
  public readonly schemas: Record<string, EnvVarSchema>;

  /**
   * Preprocessing configuration for environment variable types
   */
  public readonly preprocess: Preprocessors;

  /**
   * Patterns used to detect secret environment variables
   */
  public readonly secrets: SecretPatterns;

  /**
   * Create an EnvModel instance from options
   * @param options - Specification options
   */
  constructor(options: EnvModelOptions<T>) {
    // Resolve schemas
    this.schemas = resolveSchemas(options.schemas);

    // Resolve preprocessor configuration
    this.preprocess = this.resolvePreprocessors(options.preprocess);

    // Resolve secret patterns
    this.secrets = resolveSecretPatterns(options.secrets);
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
        string: false,
        number: false,
        boolean: false,
        enum: false,
      };
    }

    if (config === true || config === undefined) {
      // Use defaults (undefined means use built-in defaults where available)
      return {};
    }

    // Partial configuration - merge with defaults
    return { ...config };
  }

  /**
   * Determine whether a given environment variable should be treated as secret.
   * @param key - Environment variable name
   * @param schema - Optional schema override; defaults to the schema registered on the model
   */
  public shouldTreatAsSecret(key: string, schema?: EnvVarSchema): boolean {
    const resolvedSchema = schema ?? this.schemas[key];
    if (!resolvedSchema) {
      return false;
    }

    return shouldTreatAsSecret(key, resolvedSchema, this.secrets);
  }
}
