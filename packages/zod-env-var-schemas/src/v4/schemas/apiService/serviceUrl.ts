import { z } from "zod";
import { API_SERVICE_DESCRIPTIONS, API_SERVICE_MESSAGES } from "../../../shared/apiService";

const schema = z
  .string()
  .describe(API_SERVICE_DESCRIPTIONS.SERVICE_URL)
  .url({ error: API_SERVICE_MESSAGES.MUST_BE_VALID_URL });

export const serviceUrlSchema = schema;
export const SERVICE_URL = serviceUrlSchema;
