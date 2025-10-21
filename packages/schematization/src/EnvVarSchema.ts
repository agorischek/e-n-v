import type { EnvVarType } from "./EnvVarType";

export interface EnvVarSchemaDetails<TValue> {
  type: EnvVarType;
  required: boolean;
  default?: TValue | null;
  description?: string;
  process?: (value: string) => TValue | undefined;
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

const ENV_VAR_TYPES = new Set(["string", "number", "boolean", "enum"]);

export function isEnvVarSchema(value: unknown): value is EnvVarSchema {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<EnvVarSchema> & {
    type?: unknown;
    secret?: unknown;
  };
  if (typeof candidate.type !== "string") {
    return false;
  }

  if (!ENV_VAR_TYPES.has(candidate.type)) {
    return false;
  }

  if ("secret" in candidate && candidate.secret !== undefined) {
    if (candidate.type !== "string" || typeof candidate.secret !== "boolean") {
      return false;
    }
  }

  return typeof candidate.required === "boolean";
}