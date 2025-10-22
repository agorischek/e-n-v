import { StringEnvVarSchema, type StringEnvVarSchemaInput } from "../../../envcredible-core/src";
import { processWithZodSchema } from "@envcredible/converters";
import { z } from "zod";
import { defaults, descriptions } from "../shared/apiService";

export const host = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.host,
    default: defaults.host,
    process: processWithZodSchema<string>(
      z.string(),
      "string"
    ),
    ...input,
  });

export const HOST = host();

export const hostSchema = {
  HOST,
} as const;