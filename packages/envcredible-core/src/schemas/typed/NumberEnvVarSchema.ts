import { EnvVarSchema } from "../EnvVarSchema";
import type { Processor } from "../../processing/Processor";
import type { EnvVarSchemaInput } from "../EnvVarSchemaInput";
import { processors } from "../../processing/processors";

export interface NumberEnvVarSchemaInput extends EnvVarSchemaInput<number> { }

export class NumberEnvVarSchema extends EnvVarSchema<number> {
  public readonly type = "number" as const;

  constructor(input: NumberEnvVarSchemaInput = {}) {
    super({
      ...input,
      process: input.process ?? processors.number()
    });
  }
}