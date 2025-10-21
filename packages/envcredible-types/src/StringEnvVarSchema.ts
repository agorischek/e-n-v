import type { EnvVarSchemaDetails } from "./EnvVarSchemaDetails";

export interface StringEnvVarSchema extends EnvVarSchemaDetails<string> {
  type: "string";
  secret?: boolean;
}