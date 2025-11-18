import {
  constraints,
  defaults,
  descriptions,
  messages,
  patterns,
} from "../../shared/openai";
import type { ZodSingleton } from "./types";

export const openaiApiKey = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.apiKey)
    .min(constraints.apiKeyMinLength, { error: messages.apiKeyMinLength })
    .regex(patterns.apiKey, { message: messages.apiKeyFormat });

export const openaiOrganizationId = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.organizationId)
    .regex(patterns.organizationId, { message: messages.organizationFormat })
    .optional();

export const openaiProjectId = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.projectId)
    .regex(patterns.projectId, { message: messages.projectFormat })
    .optional();

export const openaiBaseUrl = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.baseUrl)
    .url({ message: messages.baseUrlInvalid })
    .refine((value) => value.startsWith("https://"), {
      message: messages.baseUrlProtocol,
    })
    .optional();

export const openaiModel = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.model)
    .min(1, { message: messages.modelRequired })
    .optional();

export const openaiTimeout = (z: ZodSingleton) =>
  z
    .number()
    .describe(descriptions.timeout)
    .int({ message: messages.timeoutInteger })
    .min(constraints.timeoutMin, { message: messages.timeoutMin })
    .max(constraints.timeoutMax, { message: messages.timeoutMax })
    .default(defaults.timeout);
