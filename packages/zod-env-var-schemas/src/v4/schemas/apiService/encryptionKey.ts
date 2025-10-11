import { z } from "zod";
import { API_SERVICE_DESCRIPTIONS, API_SERVICE_LENGTHS, API_SERVICE_MESSAGES } from "../../../shared/apiService";

const schema = z
  .string()
  .describe(API_SERVICE_DESCRIPTIONS.ENCRYPTION_KEY)
  .min(API_SERVICE_LENGTHS.ENCRYPTION_KEY_MIN, { error: API_SERVICE_MESSAGES.ENCRYPTION_KEY_MIN });

export const encryptionKeySchema = schema;
export const ENCRYPTION_KEY = encryptionKeySchema;
