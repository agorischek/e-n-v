import { z } from "zod";
import { API_SERVICE_DESCRIPTIONS, API_SERVICE_LENGTHS, API_SERVICE_MESSAGES } from "../../shared/apiService";

const schema = z
  .string()
  .describe(API_SERVICE_DESCRIPTIONS.API_KEY)
  .min(API_SERVICE_LENGTHS.API_KEY_MIN, { error: API_SERVICE_MESSAGES.API_KEY_MIN });

export const apiKeySchema = schema;
export const API_KEY = apiKeySchema;
