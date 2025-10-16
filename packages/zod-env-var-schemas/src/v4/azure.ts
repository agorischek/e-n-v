import { z } from "zod";
import { descriptions, messages, patterns } from "../shared/infrastructure";

export const azureStorageConnectionString = () =>
  z
    .string()
    .describe(descriptions.azureStorageConnectionString)
    .regex(patterns.azureStorageConnectionString, {
      message: messages.azureStorageConnectionStringFormat,
    });

export const azureStorageAccountName = () =>
  z
    .string()
    .describe(descriptions.azureStorageAccountName)
    .regex(patterns.azureStorageAccountName, {
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
    .regex(patterns.azureServiceBusConnectionString, {
      message: messages.azureServiceBusConnectionStringFormat,
    });

export const azureEventHubConnectionString = () =>
  z
    .string()
    .describe(descriptions.azureEventHubConnectionString)
    .regex(patterns.azureEventHubConnectionString, {
      message: messages.azureEventHubConnectionStringFormat,
    });

export const AZURE_STORAGE_CONNECTION_STRING = azureStorageConnectionString();
export const AZURE_STORAGE_ACCOUNT_NAME = azureStorageAccountName();
export const AZURE_STORAGE_ACCOUNT_KEY = azureStorageAccountKey();
export const AZURE_SERVICE_BUS_CONNECTION_STRING =
  azureServiceBusConnectionString();
export const AZURE_EVENT_HUB_CONNECTION_STRING =
  azureEventHubConnectionString();
