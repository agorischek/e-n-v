import { descriptions, messages, patterns } from "../../shared/infrastructure";
import type { ZodSingleton } from "./types";

export const azureStorageConnectionString = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.azureStorageConnectionString)
    .regex(patterns.azureStorageConnectionString, {
      message: messages.azureStorageConnectionStringFormat,
    });

export const azureStorageAccountName = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.azureStorageAccountName)
    .regex(patterns.azureStorageAccountName, {
      message: messages.azureStorageAccountNameFormat,
    });

export const azureStorageAccountKey = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.azureStorageAccountKey)
    .min(1, { message: messages.azureStorageAccountKeyRequired });

export const azureServiceBusConnectionString = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.azureServiceBusConnectionString)
    .regex(patterns.azureServiceBusConnectionString, {
      message: messages.azureServiceBusConnectionStringFormat,
    });

export const azureEventHubConnectionString = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.azureEventHubConnectionString)
    .regex(patterns.azureEventHubConnectionString, {
      message: messages.azureEventHubConnectionStringFormat,
    });
