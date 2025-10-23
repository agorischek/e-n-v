import { EnvVarSchemaBase } from "../EnvVarSchemaBase";
import type { EnvVarSchemaInput } from "../EnvVarSchemaInput";
import { processors } from "../../processing/processors";

export interface BooleanEnvVarSchemaInput extends EnvVarSchemaInput<boolean> {}

export class BooleanEnvVarSchema extends EnvVarSchemaBase<boolean> {
  public readonly type = "boolean" as const;

  constructor(input: BooleanEnvVarSchemaInput = {}) {
    super({
      ...input,
      process: input.process ?? processors.boolean()
    });
  }
}