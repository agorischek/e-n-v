import { EnvVarSchema } from "../EnvVarSchema";
import type { Processor } from "../../processing/Processor";
import type { EnvVarSchemaInput } from "../EnvVarSchemaInput";
import { processors } from "../../processing/processors";

export interface BooleanEnvVarSchemaInput extends EnvVarSchemaInput<boolean> {}

export class BooleanEnvVarSchema extends EnvVarSchema<boolean> {
  public readonly type = "boolean" as const;

  constructor(input: BooleanEnvVarSchemaInput = {}) {
    super({
      ...input,
      process: input.process ?? processors.boolean()
    });
  }
}