import { StringEnvVarSchema, type StringEnvVarSchemaInput } from "../../../envcredible-core/src";
import { processWithZodSchema } from "@envcredible/converters";
import { z } from "zod";
import { descriptions, messages } from "../shared/infrastructure";
import { patterns } from "../shared/apiService";

export const elasticsearchUrl = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.elasticsearchUrl,
    process: processWithZodSchema<string>(
      z.string()
        .url({ message: messages.elasticsearchUrlFormat })
        .regex(patterns.httpProtocol, {
          message: messages.elasticsearchUrlProtocol,
        }),
      "string"
    ),
    ...input,
  });

export const elasticsearchUsername = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.elasticsearchUsername,
    process: processWithZodSchema<string>(
      z.string(),
      "string"
    ),
    required: false,
    ...input,
  });

export const elasticsearchPassword = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.elasticsearchPassword,
    process: processWithZodSchema<string>(
      z.string(),
      "string"
    ),
    secret: true,
    required: false,
    ...input,
  });

export const ELASTICSEARCH_URL = elasticsearchUrl();
export const ELASTICSEARCH_USERNAME = elasticsearchUsername();
export const ELASTICSEARCH_PASSWORD = elasticsearchPassword();

export const elasticsearch = {
  ELASTICSEARCH_URL,
  ELASTICSEARCH_USERNAME,
  ELASTICSEARCH_PASSWORD,
} as const;