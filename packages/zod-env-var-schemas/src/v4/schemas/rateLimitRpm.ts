import { z } from "zod";
import { defaults, descriptions, constraints, messages } from "../../shared/apiService";

const schema = z
  .number()
  .describe(descriptions.rateLimitRpm)
  .int({ error: messages.rateLimitRpmInt })
  .min(constraints.rateLimitRpmMin, { error: messages.rateLimitRpmMin })
  .max(constraints.rateLimitRpmMax, { error: messages.rateLimitRpmMax })
  .default(defaults.rateLimitRpm);

export const rateLimitRpmSchema = schema;
export const RATE_LIMIT_RPM = rateLimitRpmSchema;
