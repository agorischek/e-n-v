import { z } from "zod";
import {
  INFRASTRUCTURE_DESCRIPTIONS,
  INFRASTRUCTURE_LIMITS,
  INFRASTRUCTURE_MESSAGES,
} from "../../../shared/infrastructure";

const schema = z
  .string()
  .describe(INFRASTRUCTURE_DESCRIPTIONS.DATADOG_API_KEY)
  .length(INFRASTRUCTURE_LIMITS.DATADOG_API_KEY_LENGTH, {
    error: INFRASTRUCTURE_MESSAGES.DATADOG_API_KEY_LENGTH,
  })
  .optional();

export const datadogApiKeySchema = schema;
export const DATADOG_API_KEY = datadogApiKeySchema;
