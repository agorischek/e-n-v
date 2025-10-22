import { StringEnvVarSchema, NumberEnvVarSchema, type StringEnvVarSchemaInput, type NumberEnvVarSchemaInput } from "../../../envcredible-core/src";
import { processWithZodSchema } from "@envcredible/converters";
import { z } from "zod";
import {
  constraints,
  defaults,
  descriptions,
  messages,
  patterns,
} from "../shared/openai";

export const openaiApiKey = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.apiKey,
    process: processWithZodSchema<string>(
      z.string()
        .min(constraints.apiKeyMinLength, { message: messages.apiKeyMinLength })
        .regex(patterns.apiKey, { message: messages.apiKeyFormat }),
      "string"
    ),
    secret: true,
    ...input,
  });

export const openaiOrganizationId = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.organizationId,
    process: processWithZodSchema<string>(
      z.string().regex(patterns.organizationId, { message: messages.organizationFormat }),
      "string"
    ),
    required: false,
    ...input,
  });

export const openaiProjectId = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.projectId,
    process: processWithZodSchema<string>(
      z.string().regex(patterns.projectId, { message: messages.projectFormat }),
      "string"
    ),
    required: false,
    ...input,
  });

export const openaiBaseUrl = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.baseUrl,
    process: processWithZodSchema<string>(
      z.string()
        .url({ message: messages.baseUrlInvalid })
        .refine((value) => value.startsWith("https://"), {
          message: messages.baseUrlProtocol,
        }),
      "string"
    ),
    required: false,
    ...input,
  });

export const openaiModel = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.model,
    process: processWithZodSchema<string>(
      z.string().min(1, { message: messages.modelRequired }),
      "string"
    ),
    required: false,
    ...input,
  });

export const openaiTimeout = (input: Partial<NumberEnvVarSchemaInput> = {}) =>
  new NumberEnvVarSchema({
    description: descriptions.timeout,
    default: defaults.timeout,
    process: processWithZodSchema<number>(
      z.coerce.number()
        .int({ message: messages.timeoutInteger })
        .min(constraints.timeoutMin, { message: messages.timeoutMin })
        .max(constraints.timeoutMax, { message: messages.timeoutMax }),
      "number"
    ),
    ...input,
  });

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