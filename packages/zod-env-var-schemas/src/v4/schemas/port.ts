import { z } from "zod";
import { defaults, descriptions, limits, messages } from "../../shared/apiService";

const schema = z
  .number()
  .describe(descriptions.port)
  .int({ error: messages.portInt })
  .min(limits.portMin, { error: messages.portMin })
  .max(limits.portMax, { error: messages.portMax })
  .default(defaults.port);

export const portSchema = schema;
export const PORT = portSchema;
