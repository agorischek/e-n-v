import { EnvVarSchema } from "./EnvVarSchema";
import type { Processor } from "./Processor";
import type { EnvVarSchemaSharedInput } from "./EnvVarSchemaSharedInput";
import { defaultProcessors } from "./processors";

export interface EnumEnvVarSchemaInput extends EnvVarSchemaSharedInput<string> {
  values: readonly string[];
}

export class EnumEnvVarSchema extends EnvVarSchema<string> {
  public readonly type = "enum" as const;
  public readonly values: readonly string[];

  constructor(input: EnumEnvVarSchemaInput) {
    super(input);
    this.values = input.values;
  }

  protected getDefaultProcessor(): Processor<string> {
    return defaultProcessors.enum(this.values);
  }
}