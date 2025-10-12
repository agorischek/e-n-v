import { z } from "zod";
import { HTTP_PROTOCOL_PATTERN } from "../../shared/patterns";
import { descriptions, messages } from "../../shared/apiService";

export const apiBaseUrlSchema = z
  .url()
  .describe(descriptions.apiBaseUrl)
  .regex(HTTP_PROTOCOL_PATTERN, { error: messages.httpProtocolRequired });

export const apiBaseUrl = () => apiBaseUrlSchema;
export const API_BASE_URL = apiBaseUrlSchema;
