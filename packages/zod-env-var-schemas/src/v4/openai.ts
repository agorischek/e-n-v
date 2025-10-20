import { z } from "zod";
import {
  constraints,
  defaults,
  descriptions,
  messages,
  patterns,
} from "../shared/openai";

export const openaiApiKey = () =>
  z
    .string()
    .describe(descriptions.apiKey)
    .min(constraints.apiKeyMinLength, { error: messages.apiKeyMinLength })
    .regex(patterns.apiKey, { message: messages.apiKeyFormat });

export const openaiOrganizationId = () =>
  z
    .string()
    .describe(descriptions.organizationId)
    .regex(patterns.organizationId, { message: messages.organizationFormat })
    .optional();

export const openaiProjectId = () =>
  z
    .string()
    .describe(descriptions.projectId)
    .regex(patterns.projectId, { message: messages.projectFormat })
    .optional();

export const openaiBaseUrl = () =>
  z
    .string()
    .describe(descriptions.baseUrl)
    .url({ message: messages.baseUrlInvalid })
    .refine((value) => value.startsWith("https://"), {
      message: messages.baseUrlProtocol,
    })
    .optional();

export const openaiModel = () =>
  z
    .string()
    .describe(descriptions.model)
    .min(1, { message: messages.modelRequired })
    .optional();

export const openaiTimeout = () =>
  z
    .number()
    .describe(descriptions.timeout)
    .int({ message: messages.timeoutInteger })
    .min(constraints.timeoutMin, { message: messages.timeoutMin })
    .max(constraints.timeoutMax, { message: messages.timeoutMax })
    .default(defaults.timeout);

export const OPENAI_API_KEY = openaiApiKey();
export const OPENAI_ORGANIZATION_ID = openaiOrganizationId();
export const OPENAI_PROJECT_ID = openaiProjectId();
export const OPENAI_BASE_URL = openaiBaseUrl();
export const OPENAI_MODEL = openaiModel();
export const OPENAI_TIMEOUT = openaiTimeout();

export const openai = {
  OPENAI_API_KEY,
  OPENAI_ORGANIZATION_ID,
  OPENAI_PROJECT_ID,
  OPENAI_BASE_URL,
  OPENAI_MODEL,
  OPENAI_TIMEOUT,
} as const;
