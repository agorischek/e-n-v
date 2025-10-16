import type { EnvVarType } from "./EnvVarType";
import type { Validate } from "../vendor/PromptOptions";

export interface EnvVarSchemaDetails<TValue> {
  type: EnvVarType;
  required: boolean;
  preset?: TValue | null;
  description?: string;
  validate?: Validate<TValue>;
}

export interface StringEnvVarSchema extends EnvVarSchemaDetails<string> {
  type: "string";
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

const ENV_VAR_TYPES = new Set(["string", "number", "boolean", "enum"]);

export function isEnvVarSchema(value: unknown): value is EnvVarSchema {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<EnvVarSchema> & { type?: unknown };
  if (typeof candidate.type !== "string") {
    return false;
  }

  if (!ENV_VAR_TYPES.has(candidate.type)) {
    return false;
  }

  return typeof candidate.required === "boolean";
}
