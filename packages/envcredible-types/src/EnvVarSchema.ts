import type { Processor } from "./Processor";
import type { EnvVarType } from "./EnvVarType";
import type { EnvVarSchemaSharedInput } from "./EnvVarSchemaSharedInput";
import { defaultProcessors } from "./processors";

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
    this.process = input.process ?? this.getDefaultProcessor();
  }

  protected abstract getDefaultProcessor(): Processor<T>;
}