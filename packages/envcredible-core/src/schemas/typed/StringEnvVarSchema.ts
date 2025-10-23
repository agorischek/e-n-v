import { EnvVarSchemaBase } from "../EnvVarSchemaBase";
import type { EnvVarSchemaInput } from "../EnvVarSchemaInput";
import { processors } from "../../processing/processors";

export interface StringEnvVarSchemaInput extends EnvVarSchemaInput<string> {
  secret?: boolean;
}

export class StringEnvVarSchema extends EnvVarSchemaBase<string> {
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