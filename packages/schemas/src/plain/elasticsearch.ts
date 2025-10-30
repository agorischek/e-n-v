import { StringEnvVarSchema, type StringEnvVarSchemaInput } from "@e-n-v/core";
import { string, url, pattern } from "@e-n-v/core";
import { traits, descriptions } from "../shared/infrastructure";
import { patterns } from "../shared/apiService";

export const elasticsearchUrl = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.elasticsearchUrl,
    process: string(
      url(traits.elasticsearchUrlFormat),
      pattern(patterns.httpProtocol, traits.elasticsearchUrlProtocol)
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

