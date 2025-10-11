import { z } from "zod";
import { API_SERVICE_DESCRIPTIONS, API_SERVICE_LENGTHS, API_SERVICE_MESSAGES } from "../../../shared/apiService";

const schema = z
  .string()
  .describe(API_SERVICE_DESCRIPTIONS.SESSION_SECRET)
  .min(API_SERVICE_LENGTHS.SESSION_SECRET_MIN, { error: API_SERVICE_MESSAGES.SESSION_SECRET_MIN });

export const sessionSecretSchema = schema;
export const SESSION_SECRET = sessionSecretSchema;
