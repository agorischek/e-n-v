/**
 * e-n-v - "Environments, niftily? Very!"
 *
 * A unified, elegant API for environment variable management
 * Combines spec, parse, and prompt into a cohesive workflow
 */

// Main exports
export { spec } from "@envcredible/specification";
export { parse } from "shape-env";
export { prompt } from "prompt-env";
export { defaults } from "./defaults";

// Re-export types
export type { EnvSpec, EnvSpecOptions } from "@envcredible/specification";
export type { DirectEnvOptions } from "shape-env";
export type { PromptEnvOptions } from "prompt-env";
export type { SupportedSchema } from "@envcredible/schemata";

// Re-export errors for convenience
export {
  MissingEnvVarError,
  ValidationError,
  EnvValidationAggregateError,
} from "shape-env";

// Re-export schema builders
export { schema, s } from "@envcredible/core";
