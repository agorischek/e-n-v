import { StringEnvVarSchema, type StringEnvVarSchemaInput } from "@e-n-v/core";
import { string, url, pattern } from "../validation";
import { attributes, descriptions } from "../shared/infrastructure";
import { patterns } from "../shared/apiService";

export const elasticsearchUrl = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.elasticsearchUrl,
    process: string(
      url(attributes.elasticsearchUrlFormat),
      pattern(patterns.httpProtocol, attributes.elasticsearchUrlProtocol)
    ),
    ...input,
  });

export const elasticsearchUsername = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.elasticsearchUsername,
    process: string(),
    required: false,
    ...input,
  });

export const elasticsearchPassword = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.elasticsearchPassword,
    process: string(),
    secret: true,
    required: false,
    ...input,
  });

export const ELASTICSEARCH_URL = elasticsearchUrl();
export const ELASTICSEARCH_USERNAME = elasticsearchUsername();
export const ELASTICSEARCH_PASSWORD = elasticsearchPassword();

