import { z } from "zod";
import { defaults, descriptions, limits, messages } from "../../shared/apiService";

const schema = z
  .number()
  .describe(descriptions.maxFileSize)
  .int({ error: messages.maxFileSizeInt })
  .min(limits.maxFileSizeMin, { error: messages.maxFileSizeMin })
  .max(limits.maxFileSizeMax, { error: messages.maxFileSizeMax })
  .default(defaults.maxFileSize);

export const maxFileSizeSchema = schema;
export const MAX_FILE_SIZE = maxFileSizeSchema;
