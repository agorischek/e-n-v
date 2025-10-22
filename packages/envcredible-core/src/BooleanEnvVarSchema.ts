import { EnvVarSchema } from "./EnvVarSchema";
import type { Processor } from "./Processor";
import type { EnvVarSchemaSharedInput } from "./EnvVarSchemaSharedInput";
import { processors } from "./processors";

export interface BooleanEnvVarSchemaInput extends EnvVarSchemaSharedInput<boolean> {}

export class BooleanEnvVarSchema extends EnvVarSchema<boolean> {
  public readonly type = "boolean" as const;

  constructor(input: BooleanEnvVarSchemaInput = {}) {
    super({
      ...input,
      process: input.process ?? processors.boolean()
    });
  }
}