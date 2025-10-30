import {
  StringEnvVarSchema,
  NumberEnvVarSchema,
  type StringEnvVarSchemaInput,
  type NumberEnvVarSchemaInput,
} from "@e-n-v/core";
import {
  string,
  number,
  minLength,
  pattern,
  url,
  integer,
  between,
  custom,
} from "../validation";
import {
  constraints,
  defaults,
  descriptions,
  attributes,
  patterns,
} from "../shared/openai";

export const openaiApiKey = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.apiKey,
    process: string(
      minLength(constraints.apiKeyMinLength, attributes.apiKeyMinLength),
      pattern(patterns.apiKey, attributes.apiKeyFormat)
    ),
    secret: true,
    ...input,
  });

export const openaiOrganizationId = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.organizationId,
    process: string(
      pattern(patterns.organizationId, attributes.organizationFormat)
    ),
    required: false,
    ...input,
  });

export const openaiProjectId = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.projectId,
    process: string(
      pattern(patterns.projectId, attributes.projectFormat)
    ),
    required: false,
    ...input,
  });

export const openaiBaseUrl = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.baseUrl,
    process: string(
      url(attributes.baseUrlInvalid),
      custom((value) => value.startsWith("https://"), attributes.baseUrlProtocol)
    ),
    required: false,
    ...input,
  });

export const openaiModel = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.model,
    process: string(minLength(1, attributes.modelRequired)),
    required: false,
    ...input,
  });

export const openaiTimeout = (input: Partial<NumberEnvVarSchemaInput> = {}) =>
  new NumberEnvVarSchema({
    description: descriptions.timeout,
    default: defaults.timeout,
    process: number(
      integer(attributes.timeoutInteger),
      between(constraints.timeoutMin, constraints.timeoutMax)
    ),
    ...input,
  });

export const OPENAI_API_KEY = openaiApiKey();
export const OPENAI_ORGANIZATION_ID = openaiOrganizationId();
export const OPENAI_PROJECT_ID = openaiProjectId();
export const OPENAI_BASE_URL = openaiBaseUrl();
export const OPENAI_MODEL = openaiModel();
export const OPENAI_TIMEOUT = openaiTimeout();

