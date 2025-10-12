import { z } from "zod";
import { defaults, descriptions, limits, messages } from "../../shared/apiService";

const schema = z
  .number()
  .describe(descriptions.apiTimeout)
  .int({ error: messages.apiTimeoutInt })
  .min(limits.apiTimeoutMin, { error: messages.apiTimeoutMin })
  .max(limits.apiTimeoutMax, { error: messages.apiTimeoutMax })
  .default(defaults.apiTimeout);

export const apiTimeoutSchema = schema;
export const API_TIMEOUT = apiTimeoutSchema;
