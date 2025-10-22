import type { 
  StringEnvVarSchemaInput, 
  NumberEnvVarSchemaInput, 
  BooleanEnvVarSchemaInput, 
  EnumEnvVarSchemaInput 
} from "./schemas";
import { 
  StringEnvVarSchema, 
  NumberEnvVarSchema, 
  BooleanEnvVarSchema, 
  EnumEnvVarSchema 
} from "./schemas";

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