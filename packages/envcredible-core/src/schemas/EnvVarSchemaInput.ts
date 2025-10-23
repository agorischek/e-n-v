import type { Processor } from "../processors/Processor";

export interface EnvVarSchemaInput<T> {
  process?: Processor<T>;
  required?: boolean;
  default?: T | null;
  description?: string;
}