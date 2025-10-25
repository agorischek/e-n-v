export { load } from "./load";
export type { DirectEnvOptions } from "./options/DirectEnvOptions";
export { MissingEnvVarError } from "./errors/MissingEnvVarError";
export { ValidationError } from "./errors/ValidationError";
export { EnvValidationAggregateError } from "./errors/EnvValidationAggregateError";

// Re-export from meta
export { EnvMeta } from "@envcredible/meta";
export type { EnvMetaOptions } from "@envcredible/meta";

// Re-export useful types and utilities
export type { EnvVarSchema } from "@envcredible/core";
export { schema, s } from "@envcredible/core";
export type { SupportedSchema } from "@envcredible/schemata";
export type { EnvChannelOptions } from "@envcredible/channels";
