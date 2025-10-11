import { z } from "zod";
import { AZURE_SERVICE_BUS_CONNECTION_STRING_PATTERN } from "../../../shared/patterns";
import { INFRASTRUCTURE_DESCRIPTIONS, INFRASTRUCTURE_MESSAGES } from "../../../shared/infrastructure";

const schema = z
  .string()
  .describe(INFRASTRUCTURE_DESCRIPTIONS.AZURE_SERVICE_BUS_CONNECTION_STRING)
  .regex(AZURE_SERVICE_BUS_CONNECTION_STRING_PATTERN, {
    error: INFRASTRUCTURE_MESSAGES.AZURE_SERVICE_BUS_CONNECTION_STRING_FORMAT,
  });

export const azureServiceBusConnectionStringSchema = schema;
export const AZURE_SERVICE_BUS_CONNECTION_STRING = azureServiceBusConnectionStringSchema;
