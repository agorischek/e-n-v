import type { Processor } from "../processing/Processor";

export interface EnvVarSchemaInput<T> {
  process?: Processor<T>;
  required?: boolean;
  default?: T;
  description?: string;
  link?: string;
}
