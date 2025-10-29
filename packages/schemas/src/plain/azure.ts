import { StringEnvVarSchema, type StringEnvVarSchemaInput } from "@e-n-v/core";
import { createZodProcessor } from "../helpers/createZodProcesor";
import { z } from "zod";
import { descriptions, messages, patterns } from "../shared/infrastructure";

export const azureStorageConnectionString = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.azureStorageConnectionString,
    process: createZodProcessor(
      z.string().regex(patterns.azureStorageConnectionString, {
        message: messages.azureStorageConnectionStringFormat,
      }),
    ),
    secret: true,
    ...input,
  });

export const azureStorageAccountName = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.azureStorageAccountName,
    process: createZodProcessor(
      z.string().regex(patterns.azureStorageAccountName, {
        message: messages.azureStorageAccountNameFormat,
      }),
    ),
    ...input,
  });

export const azureStorageAccountKey = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.azureStorageAccountKey,
    process: createZodProcessor(
      z.string().min(1, { message: messages.azureStorageAccountKeyRequired }),
    ),
    secret: true,
    ...input,
  });

export const azureServiceBusConnectionString = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.azureServiceBusConnectionString,
    process: createZodProcessor(
      z.string().regex(patterns.azureServiceBusConnectionString, {
        message: messages.azureServiceBusConnectionStringFormat,
      }),
    ),
    secret: true,
    ...input,
  });

export const azureEventHubConnectionString = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.azureEventHubConnectionString,
    process: createZodProcessor(
      z.string().regex(patterns.azureEventHubConnectionString, {
        message: messages.azureEventHubConnectionStringFormat,
      }),
    ),
    secret: true,
    ...input,
  });

export const AZURE_STORAGE_CONNECTION_STRING = azureStorageConnectionString();
export const AZURE_STORAGE_ACCOUNT_NAME = azureStorageAccountName();
export const AZURE_STORAGE_ACCOUNT_KEY = azureStorageAccountKey();
export const AZURE_SERVICE_BUS_CONNECTION_STRING =
  azureServiceBusConnectionString();
export const AZURE_EVENT_HUB_CONNECTION_STRING =
  azureEventHubConnectionString();

export const azure = {
  AZURE_STORAGE_CONNECTION_STRING,
  AZURE_STORAGE_ACCOUNT_NAME,
  AZURE_STORAGE_ACCOUNT_KEY,
  AZURE_SERVICE_BUS_CONNECTION_STRING,
  AZURE_EVENT_HUB_CONNECTION_STRING,
} as const;
