export { parse } from "./load";
export { MissingEnvVarError } from "./errors/MissingEnvVarError";
export { ValidationError } from "./errors/ValidationError";
export { EnvValidationAggregateError } from "./errors/EnvValidationAggregateError";

// Re-export EnvModel (EnvSpec is legacy alias)
export { EnvModel, EnvSpec, spec } from "@e-n-v/models";
export type { EnvModelOptions, EnvSpecOptions } from "@e-n-v/models";

// Re-export useful types and utilities
export type { EnvVarSchema } from "@e-n-v/core";
export { schema, s } from "@e-n-v/core";
export type { SupportedSchema } from "@e-n-v/converters";
