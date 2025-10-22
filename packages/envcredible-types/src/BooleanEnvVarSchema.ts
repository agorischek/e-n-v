import { EnvVarSchema } from "./EnvVarSchema";
import type { Processor } from "./Processor";
import type { EnvVarSchemaSharedInput } from "./EnvVarSchemaSharedInput";
import { defaultProcessors } from "./processors";

export interface BooleanEnvVarSchemaInput extends EnvVarSchemaSharedInput<boolean> {}

export class BooleanEnvVarSchema extends EnvVarSchema<boolean> {
  public readonly type = "boolean" as const;

  constructor(input: BooleanEnvVarSchemaInput = {}) {
    super(input);
  }

  protected getDefaultProcessor(): Processor<boolean> {
    return defaultProcessors.boolean();
  }
}