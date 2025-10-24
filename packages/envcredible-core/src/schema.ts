import type { StringEnvVarSchemaInput } from "./schemas/typed/StringEnvVarSchema";
import type { NumberEnvVarSchemaInput } from "./schemas/typed/NumberEnvVarSchema";
import type { BooleanEnvVarSchemaInput } from "./schemas/typed/BooleanEnvVarSchema";
import type { EnumEnvVarSchemaInput } from "./schemas/typed/EnumEnvVarSchema";
import { StringEnvVarSchema } from "./schemas/typed/StringEnvVarSchema";
import { NumberEnvVarSchema } from "./schemas/typed/NumberEnvVarSchema";
import { BooleanEnvVarSchema } from "./schemas/typed/BooleanEnvVarSchema";
import { EnumEnvVarSchema } from "./schemas/typed/EnumEnvVarSchema";

export const schema = {
  string: (input: StringEnvVarSchemaInput = {}) =>
    new StringEnvVarSchema(input),

  number: (input: NumberEnvVarSchemaInput = {}) =>
    new NumberEnvVarSchema(input),

  boolean: (input: BooleanEnvVarSchemaInput = {}) =>
    new BooleanEnvVarSchema(input),

  enum: <T extends string = string>(input: EnumEnvVarSchemaInput<T>) =>
    new EnumEnvVarSchema<T>(input),
};
