import type { StringEnvVarSchemaInput } from "./schemas/StringEnvVarSchema";
import type { NumberEnvVarSchemaInput } from "./schemas/NumberEnvVarSchema";
import type { BooleanEnvVarSchemaInput } from "./schemas/BooleanEnvVarSchema";
import type { EnumEnvVarSchemaInput } from "./schemas/EnumEnvVarSchema";
import { StringEnvVarSchema } from "./schemas/StringEnvVarSchema";
import { NumberEnvVarSchema } from "./schemas/NumberEnvVarSchema";
import { BooleanEnvVarSchema } from "./schemas/BooleanEnvVarSchema";
import { EnumEnvVarSchema } from "./schemas/EnumEnvVarSchema";

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