import type { Preprocessors } from "@envcredible/core";
import type { SupportedSchema } from "@envcredible/schemata";

/**
 * Options for creating an EnvDefinition instance
 */
export interface EnvDefinitionOptions {
  /**
   * Environment variable schemas
   * Map of variable names to their schema definitions
   */
  vars: Record<string, SupportedSchema>;

  /**
   * Preprocessing functions for environment variable types
   */
  preprocess?: Preprocessors;
}
