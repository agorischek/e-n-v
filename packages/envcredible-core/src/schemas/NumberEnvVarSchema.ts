import { EnvVarSchema } from "./EnvVarSchema";
import type { Processor } from "../processors/Processor";
import type { EnvVarSchemaSharedInput } from "./EnvVarSchemaSharedInput";
import { processors } from "../processors/processors";

export interface NumberEnvVarSchemaInput extends EnvVarSchemaSharedInput<number> {}

export class NumberEnvVarSchema extends EnvVarSchema<number> {
  public readonly type = "number" as const;

  constructor(input: NumberEnvVarSchemaInput = {}) {
    super({
      ...input,
      process: input.process ?? processors.number()
    });
  }
}