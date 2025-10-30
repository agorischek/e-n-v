import { StringEnvVarSchema, type StringEnvVarSchemaInput } from "@e-n-v/core";
import { string } from "../helpers/validators";
import { defaults, descriptions } from "../shared/apiService";

export const host = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.host,
    default: defaults.host,
    process: string(),
    ...input,
  });

export const HOST = host();

export const hostSchema = {
  HOST,
} as const;
