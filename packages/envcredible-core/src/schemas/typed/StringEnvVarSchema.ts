import { EnvVarSchema } from "../EnvVarSchema";
import type { Processor } from "../../processors/Processor";
import type { EnvVarSchemaInput } from "../EnvVarSchemaInput";
import { processors } from "../../processors/processors";

export interface StringEnvVarSchemaInput extends EnvVarSchemaInput<string> {
  secret?: boolean;
}

export class StringEnvVarSchema extends EnvVarSchema<string> {
  public readonly type = "string" as const;
  public readonly secret?: boolean;

  constructor(input: StringEnvVarSchemaInput = {}) {
    super({
      ...input,
      process: input.process ?? processors.string()
    });
    this.secret = input.secret;
  }
}