import { z } from "zod";
import { descriptions, messages, constraints } from "../../shared/infrastructure";

export const datadogApiKey = () =>
  z
    .string()
    .describe(descriptions.datadogApiKey)
    .length(constraints.datadogApiKeyLength, {
      message: messages.datadogApiKeyLength,
    })
    .optional();

export const DATADOG_API_KEY = datadogApiKey();