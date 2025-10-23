import type { Processor } from "../processing/Processor";
import type { EnvVarType } from "../types/EnvVarType";

export interface EnvVarSchemaDetails<T> {
  type: EnvVarType;
  required: boolean;
  default?: T | null;
  description?: string;
  process?: Processor<T>;
}