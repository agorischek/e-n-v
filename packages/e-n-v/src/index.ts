/**
 * e-n-v - "Environments, niftily? Very!"
 * 
 * A unified, elegant API for environment variable management
 * Combines define, load, and setup into a cohesive workflow
 */

// Main exports
export { default } from "./define";
export { define } from "./define";
export { load } from "./load";
export { setup } from "./setup";
export { defaults } from "./defaults";

// Re-export types
export type { EnvMeta, EnvMetaOptions } from "@envcredible/meta";
export type { DirectEnvOptions } from "direct-env";
export type { SupportedSchema } from "@envcredible/schemata";

// Re-export errors for convenience
export {
  MissingEnvVarError,
  ValidationError,
  EnvValidationAggregateError,
} from "direct-env";

// Re-export schema builders
export { schema, s } from "@envcredible/core";
