import { StringEnvVarSchema, type StringEnvVarSchemaInput } from "@e-n-v/core";
import { string, oneOf } from "@e-n-v/core";
import { defaults, descriptions, enumOptions } from "../shared/apiService";

export const logLevel = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.logLevel,
    default: defaults.logLevel,
    process: string(oneOf(enumOptions.logLevel)),
    ...input,
  });

export const LOG_LEVEL = logLevel();

