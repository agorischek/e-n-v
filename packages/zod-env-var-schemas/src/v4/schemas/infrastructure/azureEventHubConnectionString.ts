import { z } from "zod";
import { AZURE_EVENT_HUB_CONNECTION_STRING_PATTERN } from "../../../shared/patterns";
import { INFRASTRUCTURE_DESCRIPTIONS, INFRASTRUCTURE_MESSAGES } from "../../../shared/infrastructure";

const schema = z
  .string()
  .describe(INFRASTRUCTURE_DESCRIPTIONS.AZURE_EVENT_HUB_CONNECTION_STRING)
  .regex(AZURE_EVENT_HUB_CONNECTION_STRING_PATTERN, {
    error: INFRASTRUCTURE_MESSAGES.AZURE_EVENT_HUB_CONNECTION_STRING_FORMAT,
  });

export const azureEventHubConnectionStringSchema = schema;
export const AZURE_EVENT_HUB_CONNECTION_STRING = azureEventHubConnectionStringSchema;
