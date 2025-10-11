import { z } from "zod";
import { AZURE_STORAGE_ACCOUNT_NAME_PATTERN } from "../../../shared/patterns";
import { INFRASTRUCTURE_DESCRIPTIONS, INFRASTRUCTURE_MESSAGES } from "../../../shared/infrastructure";

const schema = z
  .string()
  .describe(INFRASTRUCTURE_DESCRIPTIONS.AZURE_STORAGE_ACCOUNT_NAME)
  .regex(AZURE_STORAGE_ACCOUNT_NAME_PATTERN, {
    error: INFRASTRUCTURE_MESSAGES.AZURE_STORAGE_ACCOUNT_NAME_FORMAT,
  });

export const azureStorageAccountNameSchema = schema;
export const AZURE_STORAGE_ACCOUNT_NAME = azureStorageAccountNameSchema;
