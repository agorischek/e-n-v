/**
 * e-n-v - "Environments, niftily? Very!"
 *
 * A unified, elegant API for environment variable management
 * Combines spec, parse, and prompt into a cohesive workflow
 */

// Main exports
import { spec } from "@e-n-v/models";
export { spec };
export { spec as model };
export { parse } from "@e-n-v/parse";
export { prompt } from "@e-n-v/prompt";
export { defaults } from "./defaults";

// Re-export types
export type { EnvSpec, EnvSpecOptions } from "@e-n-v/models";
export type { DirectEnvOptions } from "@e-n-v/parse";
export type { PromptEnvOptions } from "@e-n-v/prompt";
export type { SupportedSchema } from "@e-n-v/converters";

// Re-export errors for convenience
export {
  MissingEnvVarError,
  ValidationError,
  EnvValidationAggregateError,
} from "@e-n-v/parse";

// Re-export schema builders
export { schema, s } from "@e-n-v/core";
