import { z } from "zod";
import { defaults, descriptions, constraints, messages } from "../../shared/apiService";

const schema = z
  .number()
  .describe(descriptions.apiTimeout)
  .int({ error: messages.apiTimeoutInt })
  .min(constraints.apiTimeoutMin, { error: messages.apiTimeoutMin })
  .max(constraints.apiTimeoutMax, { error: messages.apiTimeoutMax })
  .default(defaults.apiTimeout);

export const apiTimeoutSchema = schema;
export const API_TIMEOUT = apiTimeoutSchema;
