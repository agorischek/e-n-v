import { z } from "zod";
import { defaults, descriptions, limits, messages } from "../../shared/apiService";

const schema = z
  .number()
  .describe(descriptions.rateLimitWindow)
  .int({ error: messages.rateLimitWindowInt })
  .min(limits.rateLimitWindowMin, { error: messages.rateLimitWindowMin })
  .max(limits.rateLimitWindowMax, { error: messages.rateLimitWindowMax })
  .default(defaults.rateLimitWindow);

export const rateLimitWindowSchema = schema;
export const RATE_LIMIT_WINDOW = rateLimitWindowSchema;
