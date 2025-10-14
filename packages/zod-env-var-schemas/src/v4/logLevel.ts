import { z } from "zod";
import { defaults, descriptions, enumOptions } from "../shared/apiService";

const schema = z
  .enum([...enumOptions.logLevel])
  .describe(descriptions.logLevel)
  .default(defaults.logLevel);

export const logLevelSchema = schema;
export const LOG_LEVEL = logLevelSchema;
