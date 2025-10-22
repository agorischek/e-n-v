import { EnvVarSchema } from "./EnvVarSchema";
import type { Processor } from "./Processor";
import type { EnvVarSchemaSharedInput } from "./EnvVarSchemaSharedInput";
import { defaultProcessors } from "./processors";

export interface NumberEnvVarSchemaInput extends EnvVarSchemaSharedInput<number> {}

export class NumberEnvVarSchema extends EnvVarSchema<number> {
  public readonly type = "number" as const;

  constructor(input: NumberEnvVarSchemaInput = {}) {
    super(input);
  }

  protected getDefaultProcessor(): Processor<number> {
    return defaultProcessors.number();
  }
}