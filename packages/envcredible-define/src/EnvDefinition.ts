import type { EnvVarSchema, Preprocessors } from "@envcredible/core";
import { resolveSchemas } from "@envcredible/schemata";
import type { EnvDefinitionOptions } from "./EnvDefinitionOptions";

/**
 * Definition container for environment variable configuration
 * Encapsulates schemas and preprocessors
 */
export class EnvDefinition {
  /**
   * Resolved environment variable schemas
   */
  public readonly schemas: Record<string, EnvVarSchema>;

  /**
   * Preprocessing functions for environment variable types
   */
  public readonly preprocess?: Preprocessors;

  /**
   * Create an EnvDefinition instance from options
   * @param options - Configuration options
   */
  constructor(options: EnvDefinitionOptions) {
    // Resolve schemas
    this.schemas = resolveSchemas(options.vars);

    // Store preprocessors
    this.preprocess = options.preprocess;
  }
}
