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
  url,
  pattern,
  integer,
  between,
} from "@e-n-v/core";
import {
  traits,
  constraints,
  defaults,
  descriptions,
  patterns,
} from "../shared/apiService";

export const apiKey = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.apiKey,
    process: string(
      minLength(constraints.apiKeyMinLength, traits.apiKeyMin)
    ),
    ...input,
  });

export const apiBaseUrl = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.apiBaseUrl,
    process: string(
      url(),
      pattern(patterns.httpProtocol, traits.httpProtocolRequired)
    ),
    ...input,
  });

export const apiTimeout = (input: Partial<NumberEnvVarSchemaInput> = {}) =>
  new NumberEnvVarSchema({
    description: descriptions.apiTimeout,
    default: defaults.apiTimeout,
    process: number(
      integer(traits.apiTimeoutInt),
      between(constraints.apiTimeoutMin, constraints.apiTimeoutMax)
    ),
    ...input,
  });

export const API_KEY = apiKey();
export const API_BASE_URL = apiBaseUrl();
export const API_TIMEOUT = apiTimeout();
