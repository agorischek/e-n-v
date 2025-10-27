export { parse } from "./load";
export { parse as load } from "./load"; // Backwards compatibility alias
export type { DirectEnvOptions } from "./options/DirectEnvOptions";
export { MissingEnvVarError } from "./errors/MissingEnvVarError";
export { ValidationError } from "./errors/ValidationError";
export { EnvValidationAggregateError } from "./errors/EnvValidationAggregateError";

// Re-export EnvSpec
export { EnvSpec, spec } from "@envcredible/specification";
export type { EnvSpecOptions } from "@envcredible/specification";

// Re-export useful types and utilities
export type { EnvVarSchema } from "@envcredible/core";
export { schema, s } from "@envcredible/core";
export type { SupportedSchema } from "@envcredible/schemata";
