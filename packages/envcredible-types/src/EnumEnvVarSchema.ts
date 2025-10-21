import type { EnvVarSchemaDetails } from "./EnvVarSchemaDetails";

export interface EnumEnvVarSchema extends EnvVarSchemaDetails<string> {
  type: "enum";
  values: readonly string[];
}