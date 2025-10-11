import { z } from "zod";
import {
  API_SERVICE_DEFAULTS,
  API_SERVICE_DESCRIPTIONS,
  API_SERVICE_ENUM_OPTIONS,
} from "../../../shared/apiService";

const schema = z
  .enum([...API_SERVICE_ENUM_OPTIONS.LOG_LEVEL])
  .describe(API_SERVICE_DESCRIPTIONS.LOG_LEVEL)
  .default(API_SERVICE_DEFAULTS.LOG_LEVEL);

export const logLevelSchema = schema;
export const LOG_LEVEL = logLevelSchema;
