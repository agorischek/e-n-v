import { z } from "zod";
import { defaults, descriptions, constraints, messages } from "../../shared/apiService";

const schema = z
  .number()
  .describe(descriptions.rateLimitWindow)
  .int({ error: messages.rateLimitWindowInt })
  .min(constraints.rateLimitWindowMin, { error: messages.rateLimitWindowMin })
  .max(constraints.rateLimitWindowMax, { error: messages.rateLimitWindowMax })
  .default(defaults.rateLimitWindow);

export const rateLimitWindowSchema = schema;
export const RATE_LIMIT_WINDOW = rateLimitWindowSchema;
