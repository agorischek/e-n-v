import type { Process } from "./vendor";

export type EnvVarType = "string" | "number" | "boolean" | "enum";

export interface EnvVarSchemaDetails<T> {
  type: EnvVarType;
  required: boolean;
  default?: T | null;
  description?: string;
  process?: Process<T>;
}

export interface StringEnvVarSchema extends EnvVarSchemaDetails<string> {
  type: "string";
  secret?: boolean;
}

export interface NumberEnvVarSchema extends EnvVarSchemaDetails<number> {
  type: "number";
}

export interface BooleanEnvVarSchema extends EnvVarSchemaDetails<boolean> {
  type: "boolean";
}

export interface EnumEnvVarSchema extends EnvVarSchemaDetails<string> {
  type: "enum";
  values: readonly string[];
}

export type EnvVarSchema =
  | StringEnvVarSchema
  | NumberEnvVarSchema
  | BooleanEnvVarSchema
  | EnumEnvVarSchema;

export type EnvVarSpec = EnvVarSchema;

