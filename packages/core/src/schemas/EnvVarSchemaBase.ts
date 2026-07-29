import type { Processor } from "../processing/types/Processor";
import type { EnvVarType } from "../types/EnvVarType";
import type { EnvVarSchemaInput } from "./EnvVarSchemaInput";

export abstract class EnvVarSchemaBase<T> {
  public abstract readonly type: EnvVarType;
  public readonly required: boolean;
  public readonly default?: T;
  public readonly description?: string;
  public readonly link?: string;
  public readonly process: Processor<T>;

  constructor(input: EnvVarSchemaInput<T>) {
    this.required = input?.required ?? true;
    this.default = input?.default;
    this.description = input?.description;
    this.link = input?.link;
    this.process = input.process!; // Will be guaranteed by concrete classes
  }
}
