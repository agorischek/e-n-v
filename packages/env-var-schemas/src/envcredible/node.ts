import { StringEnvVarSchema, type StringEnvVarSchemaInput } from "../../../envcredible-core/src";
import { processWithZodSchema } from "@envcredible/converters";
import { z } from "zod";
import { defaults, descriptions, enumOptions } from "../shared/apiService";

export const nodeEnv = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.nodeEnv,
    default: defaults.nodeEnv,
    process: processWithZodSchema<string>(
      z.enum([...enumOptions.nodeEnv]),
      "string"
    ),
    ...input,
  });

export const NODE_ENV = nodeEnv();

export const node = {
  NODE_ENV,
} as const;