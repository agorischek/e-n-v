import type { EnvVarSchemaDetails } from "./EnvVarSchemaDetails";

export interface NumberEnvVarSchema extends EnvVarSchemaDetails<number> {
  type: "number";
}