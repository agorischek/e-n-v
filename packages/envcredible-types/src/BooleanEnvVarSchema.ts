import type { EnvVarSchemaDetails } from "./EnvVarSchemaDetails";

export interface BooleanEnvVarSchema extends EnvVarSchemaDetails<boolean> {
  type: "boolean";
}