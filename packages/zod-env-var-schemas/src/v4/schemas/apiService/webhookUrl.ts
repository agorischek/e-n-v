import { z } from "zod";
import { HTTPS_PROTOCOL_PATTERN } from "../../../shared/patterns";
import { API_SERVICE_DESCRIPTIONS, API_SERVICE_MESSAGES } from "../../../shared/apiService";

const schema = z
  .string()
  .describe(API_SERVICE_DESCRIPTIONS.WEBHOOK_URL)
  .url({ error: API_SERVICE_MESSAGES.MUST_BE_VALID_URL })
  .regex(HTTPS_PROTOCOL_PATTERN, { error: API_SERVICE_MESSAGES.HTTPS_PROTOCOL_REQUIRED });

export const webhookUrlSchema = schema;
export const WEBHOOK_URL = webhookUrlSchema;
