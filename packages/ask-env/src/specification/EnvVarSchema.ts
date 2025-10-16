import type { EnvVarType } from "./EnvVarType";
import type { Validate } from "../vendor/PromptOptions";

export interface EnvVarSchemaDetails<TValue> {
  type: EnvVarType;
  required: boolean;
  nullable: boolean;
  defaultValue?: TValue | null;
  description?: string;
  validate?: Validate<TValue>;
}

export interface StringEnvVarSchema extends EnvVarSchemaDetails<string> {
  type: "string";
  min?: number;
  max?: number;
}

export interface NumberEnvVarSchema extends EnvVarSchemaDetails<number> {
  type: "number";
  min?: number;
  max?: number;
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
