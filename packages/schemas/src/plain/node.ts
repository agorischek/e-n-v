import { EnumEnvVarSchema, type StringEnvVarSchemaInput } from "@e-n-v/core";
import { string, oneOf } from "../validation";
import { defaults, descriptions, enumOptions } from "../shared/apiService";

export const nodeEnv = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new EnumEnvVarSchema({
    values: [...enumOptions.nodeEnv],
    description: descriptions.nodeEnv,
    default: defaults.nodeEnv,
    process: string(oneOf(enumOptions.nodeEnv)),
    ...input,
  });

export const NODE_ENV = nodeEnv();

