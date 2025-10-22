import type { Processor } from "./Processor";

export interface EnvVarSchemaSharedInput<T> {
  process?: Processor<T>;
  required?: boolean;
  default?: T | null;
  description?: string;
}