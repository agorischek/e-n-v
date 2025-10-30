import { StringEnvVarSchema, type StringEnvVarSchemaInput } from "@e-n-v/core";
import { string, pattern, minLength } from "../helpers/validators";
import { attributes, descriptions, patterns } from "../shared/infrastructure";

export const azureStorageConnectionString = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.azureStorageConnectionString,
    process: string(
      pattern(
        patterns.azureStorageConnectionString,
        attributes.azureStorageConnectionStringFormat
      )
    ),
    secret: true,
    ...input,
  });

export const azureStorageAccountName = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.azureStorageAccountName,
    process: string(
      pattern(
        patterns.azureStorageAccountName,
        attributes.azureStorageAccountNameFormat
      )
    ),
    ...input,
  });

export const azureStorageAccountKey = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.azureStorageAccountKey,
    process: string(minLength(1, attributes.azureStorageAccountKeyRequired)),
    secret: true,
    ...input,
  });

export const azureServiceBusConnectionString = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.azureServiceBusConnectionString,
    process: string(
      pattern(
        patterns.azureServiceBusConnectionString,
        attributes.azureServiceBusConnectionStringFormat
      )
    ),
    secret: true,
    ...input,
  });

export const azureEventHubConnectionString = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.azureEventHubConnectionString,
    process: string(
      pattern(
        patterns.azureEventHubConnectionString,
        attributes.azureEventHubConnectionStringFormat
      )
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
