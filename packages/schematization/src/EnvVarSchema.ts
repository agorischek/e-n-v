// Re-export types from @envcredible/types
export type {
  EnvVarType,
  EnvVarSchemaDetails,
  StringEnvVarSchema,
  NumberEnvVarSchema,
  BooleanEnvVarSchema,
  EnumEnvVarSchema,
  EnvVarSchemaUnion as EnvVarSchema,
} from "@envcredible/types";

// Maintain backward compatibility
export type EnvVarSpec = import("@envcredible/types").EnvVarSchemaUnion;

const ENV_VAR_TYPES = new Set(["string", "number", "boolean", "enum"]);

export function isEnvVarSchema(value: unknown): value is import("@envcredible/types").EnvVarSchemaUnion {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<import("@envcredible/types").EnvVarSchemaUnion> & {
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