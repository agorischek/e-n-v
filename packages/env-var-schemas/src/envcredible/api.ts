import { StringEnvVarSchema, NumberEnvVarSchema, type StringEnvVarSchemaInput, type NumberEnvVarSchemaInput } from "../../../envcredible-core/src";
import { createZodProcessor } from "../helpers/createZodProcesor";
import { z } from "zod";
import {
  constraints,
  defaults,
  descriptions,
  messages,
  patterns,
} from "../shared/apiService";

export const apiKey = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.apiKey,
    process: createZodProcessor(
      z.string().min(constraints.apiKeyMinLength, { message: messages.apiKeyMin }),
    ),
    ...input,
  });

export const apiBaseUrl = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.apiBaseUrl,
    process: createZodProcessor(
      z.string()
        .url({ message: "Must be a valid URL" })
        .refine(
          (url) => patterns.httpProtocol.test(url),
          { message: messages.httpProtocolRequired }
        ),
    ),
    ...input,
  });

export const apiTimeout = (input: Partial<NumberEnvVarSchemaInput> = {}) =>
  new NumberEnvVarSchema({
    description: descriptions.apiTimeout,
    default: defaults.apiTimeout,
    process: createZodProcessor(
      z.coerce.number()
        .int({ message: messages.apiTimeoutInt })
        .min(constraints.apiTimeoutMin, { message: messages.apiTimeoutMin })
        .max(constraints.apiTimeoutMax, { message: messages.apiTimeoutMax }),
    ),
    ...input,
  });

export const API_KEY = apiKey();
export const API_BASE_URL = apiBaseUrl();
export const API_TIMEOUT = apiTimeout();