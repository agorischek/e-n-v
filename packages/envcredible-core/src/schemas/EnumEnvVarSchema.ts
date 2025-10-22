import { EnvVarSchema } from "./EnvVarSchema";
import type { EnvVarSchemaSharedInput } from "./EnvVarSchemaSharedInput";
import { processors } from "../processors/processors";

export interface EnumEnvVarSchemaInput<T extends string = string> extends EnvVarSchemaSharedInput<T> {
  values: readonly T[];
}

export class EnumEnvVarSchema<T extends string = string> extends EnvVarSchema<T> {
  public readonly type = "enum" as const;
  public readonly values: readonly T[];

  constructor(input: EnumEnvVarSchemaInput<T>) {
    super({
      ...input,
      process: input.process ?? (processors.enum(input.values) as any)
    });
    this.values = input.values;
  }
}