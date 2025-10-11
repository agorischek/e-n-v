import { z } from "zod";
import { INFRASTRUCTURE_DESCRIPTIONS, INFRASTRUCTURE_MESSAGES } from "../../../shared/infrastructure";

const schema = z
  .string()
  .describe(INFRASTRUCTURE_DESCRIPTIONS.AZURE_STORAGE_ACCOUNT_KEY)
  .min(1, { error: INFRASTRUCTURE_MESSAGES.AZURE_STORAGE_ACCOUNT_KEY_REQUIRED });

export const azureStorageAccountKeySchema = schema;
export const AZURE_STORAGE_ACCOUNT_KEY = azureStorageAccountKeySchema;
