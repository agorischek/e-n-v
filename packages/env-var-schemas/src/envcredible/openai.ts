import { StringEnvVarSchema, NumberEnvVarSchema, type StringEnvVarSchemaInput, type NumberEnvVarSchemaInput } from "../../../envcredible-core/src";
import { createZodProcessor } from "../helpers/createZodProcesor";
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
    process: createZodProcessor(
      z.string()
        .min(constraints.apiKeyMinLength, { message: messages.apiKeyMinLength })
        .regex(patterns.apiKey, { message: messages.apiKeyFormat }),
    ),
    secret: true,
    ...input,
  });

export const openaiOrganizationId = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.organizationId,
    process: createZodProcessor(
      z.string().regex(patterns.organizationId, { message: messages.organizationFormat }),
    ),
    required: false,
    ...input,
  });

export const openaiProjectId = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.projectId,
    process: createZodProcessor(
      z.string().regex(patterns.projectId, { message: messages.projectFormat }),
    ),
    required: false,
    ...input,
  });

export const openaiBaseUrl = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.baseUrl,
    process: createZodProcessor(
      z.string()
        .url({ message: messages.baseUrlInvalid })
        .refine((value) => value.startsWith("https://"), {
          message: messages.baseUrlProtocol,
        }),
    ),
    required: false,
    ...input,
  });

export const openaiModel = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.model,
    process: createZodProcessor(
      z.string().min(1, { message: messages.modelRequired }),
    ),
    required: false,
    ...input,
  });

export const openaiTimeout = (input: Partial<NumberEnvVarSchemaInput> = {}) =>
  new NumberEnvVarSchema({
    description: descriptions.timeout,
    default: defaults.timeout,
    process: createZodProcessor(
      z.coerce.number()
        .int({ message: messages.timeoutInteger })
        .min(constraints.timeoutMin, { message: messages.timeoutMin })
        .max(constraints.timeoutMax, { message: messages.timeoutMax }),
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