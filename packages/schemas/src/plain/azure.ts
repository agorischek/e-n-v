import { StringEnvVarSchema, type StringEnvVarSchemaInput } from "@e-n-v/core";
import { string, pattern, minLength } from "@e-n-v/core";
import { traits, descriptions, patterns } from "../shared/infrastructure";

export const azureStorageConnectionString = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.azureStorageConnectionString,
    process: string(
      pattern(
        patterns.azureStorageConnectionString,
        traits.azureStorageConnectionStringFormat,
      ),
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
        traits.azureStorageAccountNameFormat,
      ),
    ),
    ...input,
  });

export const azureStorageAccountKey = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.azureStorageAccountKey,
    process: string(minLength(1, traits.azureStorageAccountKeyRequired)),
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
        traits.azureServiceBusConnectionStringFormat,
      ),
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
        traits.azureEventHubConnectionStringFormat,
      ),
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
