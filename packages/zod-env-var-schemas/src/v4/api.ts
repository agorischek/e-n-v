import { z } from "zod";
import { HTTP_PROTOCOL_PATTERN } from "../shared/patterns";
import { constraints, defaults, descriptions, messages } from "../shared/apiService";

export const apiKey = () =>
  z
    .string()
    .describe(descriptions.apiKey)
    .min(constraints.apiKeyMinLength, { error: messages.apiKeyMin });

export const apiBaseUrl = () =>
  z
    .url()
    .describe(descriptions.apiBaseUrl)
    .regex(HTTP_PROTOCOL_PATTERN, { error: messages.httpProtocolRequired });

export const apiTimeout = () =>
  z
    .number()
    .describe(descriptions.apiTimeout)
    .int({ error: messages.apiTimeoutInt })
    .min(constraints.apiTimeoutMin, { error: messages.apiTimeoutMin })
    .max(constraints.apiTimeoutMax, { error: messages.apiTimeoutMax })
    .default(defaults.apiTimeout);

export const API_KEY = apiKey();
export const API_BASE_URL = apiBaseUrl();
export const API_TIMEOUT = apiTimeout();