import { z } from "zod";
import { HTTP_PROTOCOL_PATTERN } from "../../../shared/patterns";
import { API_SERVICE_DESCRIPTIONS, API_SERVICE_MESSAGES } from "../../../shared/apiService";

const schema = z
  .string()
  .describe(API_SERVICE_DESCRIPTIONS.API_BASE_URL)
  .url({ error: API_SERVICE_MESSAGES.MUST_BE_VALID_URL })
  .regex(HTTP_PROTOCOL_PATTERN, { error: API_SERVICE_MESSAGES.HTTP_PROTOCOL_REQUIRED });

export const apiBaseUrlSchema = schema;
export const API_BASE_URL = apiBaseUrlSchema;
