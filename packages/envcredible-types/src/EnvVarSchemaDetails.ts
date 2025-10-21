import type { Processor } from "./Processor";
import type { EnvVarType } from "./EnvVarType";

export interface EnvVarSchemaDetails<T> {
  type: EnvVarType;
  required: boolean;
  default?: T | null;
  description?: string;
  process?: Processor<T>;
}