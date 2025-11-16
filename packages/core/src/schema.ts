import type { StringEnvVarSchemaInput } from "./schemas/typed/StringEnvVarSchema";
import type { NumberEnvVarSchemaInput } from "./schemas/typed/NumberEnvVarSchema";
import type { BooleanEnvVarSchemaInput } from "./schemas/typed/BooleanEnvVarSchema";
import type { EnumEnvVarSchemaInput } from "./schemas/typed/EnumEnvVarSchema";
import { StringEnvVarSchema } from "./schemas/typed/StringEnvVarSchema";
import { NumberEnvVarSchema } from "./schemas/typed/NumberEnvVarSchema";
import { BooleanEnvVarSchema } from "./schemas/typed/BooleanEnvVarSchema";
import { EnumEnvVarSchema } from "./schemas/typed/EnumEnvVarSchema";
import type { EnvVarSchemaInput } from "./schemas/EnvVarSchemaInput";
import { ArrayEnvVarSchema } from "./schemas/typed/ArrayEnvVarSchema";
import { processors } from "./processing/processors";

interface ArrayStringEnvVarSchemaInput
  extends EnvVarSchemaInput<string[]> {}

interface ArraySchemaBuilder {
  string(
    input?: ArrayStringEnvVarSchemaInput,
  ): ArrayEnvVarSchema<string>;
}

export const schema = {
  string: (input: StringEnvVarSchemaInput = {}) =>
    new StringEnvVarSchema(input),

  number: (input: NumberEnvVarSchemaInput = {}) =>
    new NumberEnvVarSchema(input),

  boolean: (input: BooleanEnvVarSchemaInput = {}) =>
    new BooleanEnvVarSchema(input),

  enum: <T extends string = string>(input: EnumEnvVarSchemaInput<T>) =>
    new EnumEnvVarSchema<T>(input),

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
};

export const s = schema;
