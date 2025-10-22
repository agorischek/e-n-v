import { EnvVarSchema } from "./EnvVarSchema";
import type { EnvVarSchemaSharedInput } from "./EnvVarSchemaSharedInput";
import { processors } from "../processors/processors";

export interface EnumEnvVarSchemaInput extends EnvVarSchemaSharedInput<string> {
  values: readonly string[];
}

export class EnumEnvVarSchema extends EnvVarSchema<string> {
  public readonly type = "enum" as const;
  public readonly values: readonly string[];

  constructor(input: EnumEnvVarSchemaInput) {
    super({
      ...input,
      process: input.process ?? processors.enum(input.values)
    });
    this.values = input.values;
  }
}