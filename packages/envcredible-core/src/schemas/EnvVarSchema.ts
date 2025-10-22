import type { Processor } from "../processors/Processor";
import type { EnvVarType } from "../types/EnvVarType";
import type { EnvVarSchemaSharedInput } from "./EnvVarSchemaSharedInput";

export abstract class EnvVarSchema<T> {
  public abstract readonly type: EnvVarType;
  public readonly required: boolean;
  public readonly default?: T | null;
  public readonly description?: string;
  public readonly process: Processor<T>;

  constructor(input: EnvVarSchemaSharedInput<T>) {
    this.required = input?.required ?? true;
    this.default = input?.default;
    this.description = input?.description;
    this.process = input.process!; // Will be guaranteed by concrete classes
  }
}