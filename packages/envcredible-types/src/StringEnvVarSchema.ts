import { EnvVarSchema } from "./EnvVarSchema";
import type { Processor } from "./Processor";
import type { EnvVarSchemaSharedInput } from "./EnvVarSchemaSharedInput";
import { defaultProcessors } from "./processors";

export interface StringEnvVarSchemaInput extends EnvVarSchemaSharedInput<string> {
  secret?: boolean;
}

export class StringEnvVarSchema extends EnvVarSchema<string> {
  public readonly type = "string" as const;
  public readonly secret?: boolean;

  constructor(input: StringEnvVarSchemaInput = {}) {
    super(input);
    this.secret = input?.secret;
  }

  protected getDefaultProcessor(): Processor<string> {
    return defaultProcessors.string();
  }
}