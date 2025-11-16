import { processors } from "./processing/processors";
import type { EnvVarSchemaInput } from "./schemas/EnvVarSchemaInput";
import { ArrayEnvVarSchema } from "./schemas/typed/ArrayEnvVarSchema";

export interface ArrayStringEnvVarSchemaInput
  extends EnvVarSchemaInput<string[]> {}

interface ArraySchemaBuilder {
  string(
    input?: ArrayStringEnvVarSchemaInput,
  ): ArrayEnvVarSchema<string>;
}

export const a = {
  array(delimiter: string = ","): ArraySchemaBuilder {
    return {
      string(
        input: ArrayStringEnvVarSchemaInput = {},
      ): ArrayEnvVarSchema<string> {
        return new ArrayEnvVarSchema<string>({
          ...input,
          delimiter,
          elementProcessor: processors.string(),
        });
      },
    };
  },
} as const;
