import { z } from "zod";
import {
  API_SERVICE_DEFAULTS,
  API_SERVICE_DESCRIPTIONS,
  API_SERVICE_LIMITS,
  API_SERVICE_MESSAGES,
} from "../../../shared/apiService";

const schema = z
  .number()
  .describe(API_SERVICE_DESCRIPTIONS.RATE_LIMIT_RPM)
  .int({ error: API_SERVICE_MESSAGES.RATE_LIMIT_RPM_INT })
  .min(API_SERVICE_LIMITS.RATE_LIMIT_RPM_MIN, { error: API_SERVICE_MESSAGES.RATE_LIMIT_RPM_MIN })
  .max(API_SERVICE_LIMITS.RATE_LIMIT_RPM_MAX, { error: API_SERVICE_MESSAGES.RATE_LIMIT_RPM_MAX })
  .default(API_SERVICE_DEFAULTS.RATE_LIMIT_RPM);

export const rateLimitRpmSchema = schema;
export const RATE_LIMIT_RPM = rateLimitRpmSchema;
