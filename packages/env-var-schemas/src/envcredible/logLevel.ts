import { StringEnvVarSchema, type StringEnvVarSchemaInput } from "../../../envcredible-core/src";
import { createZodProcessor } from "../helpers/createZodProcesor";
import { z } from "zod";
import { defaults, descriptions, enumOptions } from "../shared/apiService";

export const logLevel = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.logLevel,
    default: defaults.logLevel,
    process: createZodProcessor(
      z.enum([...enumOptions.logLevel])
    ),
    ...input,
  });

export const LOG_LEVEL = logLevel();

export const logLevelSchema = {
  LOG_LEVEL,
} as const;