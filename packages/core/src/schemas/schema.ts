import type { StringEnvVarSchemaInput } from "./typed/StringEnvVarSchema";
import type { NumberEnvVarSchemaInput } from "./typed/NumberEnvVarSchema";
import type { BooleanEnvVarSchemaInput } from "./typed/BooleanEnvVarSchema";
import type { EnumEnvVarSchemaInput } from "./typed/EnumEnvVarSchema";
import { StringEnvVarSchema } from "./typed/StringEnvVarSchema";
import { NumberEnvVarSchema } from "./typed/NumberEnvVarSchema";
import { BooleanEnvVarSchema } from "./typed/BooleanEnvVarSchema";
import { EnumEnvVarSchema } from "./typed/EnumEnvVarSchema";

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

export const s = schema;
