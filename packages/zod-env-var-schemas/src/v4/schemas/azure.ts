import { z } from "zod";
import { descriptions, messages } from "../../shared/infrastructure";
import { 
  AZURE_STORAGE_CONNECTION_STRING_PATTERN, 
  AZURE_STORAGE_ACCOUNT_NAME_PATTERN,
  AZURE_SERVICE_BUS_CONNECTION_STRING_PATTERN,
  AZURE_EVENT_HUB_CONNECTION_STRING_PATTERN 
} from "../../shared/patterns";

export const azureStorageConnectionString = () =>
  z
    .string()
    .describe(descriptions.azureStorageConnectionString)
    .regex(AZURE_STORAGE_CONNECTION_STRING_PATTERN, {
      message: messages.azureStorageConnectionStringFormat,
    });

export const azureStorageAccountName = () =>
  z
    .string()
    .describe(descriptions.azureStorageAccountName)
    .regex(AZURE_STORAGE_ACCOUNT_NAME_PATTERN, {
      message: messages.azureStorageAccountNameFormat,
    });

export const azureStorageAccountKey = () =>
  z
    .string()
    .describe(descriptions.azureStorageAccountKey)
    .min(1, { message: messages.azureStorageAccountKeyRequired });

export const azureServiceBusConnectionString = () =>
  z
    .string()
    .describe(descriptions.azureServiceBusConnectionString)
    .regex(AZURE_SERVICE_BUS_CONNECTION_STRING_PATTERN, {
      message: messages.azureServiceBusConnectionStringFormat,
    });

export const azureEventHubConnectionString = () =>
  z
    .string()
    .describe(descriptions.azureEventHubConnectionString)
    .regex(AZURE_EVENT_HUB_CONNECTION_STRING_PATTERN, {
      message: messages.azureEventHubConnectionStringFormat,
    });

export const AZURE_STORAGE_CONNECTION_STRING = azureStorageConnectionString();
export const AZURE_STORAGE_ACCOUNT_NAME = azureStorageAccountName();
export const AZURE_STORAGE_ACCOUNT_KEY = azureStorageAccountKey();
export const AZURE_SERVICE_BUS_CONNECTION_STRING = azureServiceBusConnectionString();
export const AZURE_EVENT_HUB_CONNECTION_STRING = azureEventHubConnectionString();