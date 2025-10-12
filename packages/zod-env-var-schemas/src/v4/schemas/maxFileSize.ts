import { z } from "zod";
import { defaults, descriptions, constraints, messages } from "../../shared/apiService";

const schema = z
  .number()
  .describe(descriptions.maxFileSize)
  .int({ error: messages.maxFileSizeInt })
  .min(constraints.maxFileSizeMin, { error: messages.maxFileSizeMin })
  .max(constraints.maxFileSizeMax, { error: messages.maxFileSizeMax })
  .default(defaults.maxFileSize);

export const maxFileSizeSchema = schema;
export const MAX_FILE_SIZE = maxFileSizeSchema;
