import { z } from "zod";
import {
  API_SERVICE_DEFAULTS,
  API_SERVICE_DESCRIPTIONS,
  API_SERVICE_LIMITS,
  API_SERVICE_MESSAGES,
} from "../../../shared/apiService";

const schema = z
  .number()
  .describe(API_SERVICE_DESCRIPTIONS.MAX_FILE_SIZE)
  .int({ error: API_SERVICE_MESSAGES.MAX_FILE_SIZE_INT })
  .min(API_SERVICE_LIMITS.MAX_FILE_SIZE_MIN, { error: API_SERVICE_MESSAGES.MAX_FILE_SIZE_MIN })
  .max(API_SERVICE_LIMITS.MAX_FILE_SIZE_MAX, { error: API_SERVICE_MESSAGES.MAX_FILE_SIZE_MAX })
  .default(API_SERVICE_DEFAULTS.MAX_FILE_SIZE);

export const maxFileSizeSchema = schema;
export const MAX_FILE_SIZE = maxFileSizeSchema;
