import { z } from "zod";
import { AZURE_STORAGE_CONNECTION_STRING_PATTERN } from "../../../shared/patterns";
import { INFRASTRUCTURE_DESCRIPTIONS, INFRASTRUCTURE_MESSAGES } from "../../../shared/infrastructure";

const schema = z
  .string()
  .describe(INFRASTRUCTURE_DESCRIPTIONS.AZURE_STORAGE_CONNECTION_STRING)
  .regex(AZURE_STORAGE_CONNECTION_STRING_PATTERN, {
    error: INFRASTRUCTURE_MESSAGES.AZURE_STORAGE_CONNECTION_STRING_FORMAT,
  });

export const azureStorageConnectionStringSchema = schema;
export const AZURE_STORAGE_CONNECTION_STRING = azureStorageConnectionStringSchema;
