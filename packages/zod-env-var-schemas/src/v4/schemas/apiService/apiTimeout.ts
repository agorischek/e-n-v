import { z } from "zod";
import {
  API_SERVICE_DEFAULTS,
  API_SERVICE_DESCRIPTIONS,
  API_SERVICE_LIMITS,
  API_SERVICE_MESSAGES,
} from "../../../shared/apiService";

const schema = z
  .number()
  .describe(API_SERVICE_DESCRIPTIONS.API_TIMEOUT)
  .int({ error: API_SERVICE_MESSAGES.API_TIMEOUT_INT })
  .min(API_SERVICE_LIMITS.API_TIMEOUT_MIN, { error: API_SERVICE_MESSAGES.API_TIMEOUT_MIN })
  .max(API_SERVICE_LIMITS.API_TIMEOUT_MAX, { error: API_SERVICE_MESSAGES.API_TIMEOUT_MAX })
  .default(API_SERVICE_DEFAULTS.API_TIMEOUT);

export const apiTimeoutSchema = schema;
export const API_TIMEOUT = apiTimeoutSchema;
