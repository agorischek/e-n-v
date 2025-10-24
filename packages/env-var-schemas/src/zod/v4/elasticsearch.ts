import { z } from "zod";
import { descriptions, messages } from "../../shared/infrastructure";
import { patterns } from "../../shared/apiService";

export const elasticsearchUrl = () =>
  z
    .url({ message: messages.elasticsearchUrlFormat })
    .describe(descriptions.elasticsearchUrl)
    .regex(patterns.httpProtocol, {
      message: messages.elasticsearchUrlProtocol,
    });

export const elasticsearchUsername = () =>
  z.string().describe(descriptions.elasticsearchUsername).optional();

export const elasticsearchPassword = () =>
  z.string().describe(descriptions.elasticsearchPassword).optional();

export const ELASTICSEARCH_URL = elasticsearchUrl();
export const ELASTICSEARCH_USERNAME = elasticsearchUsername();
export const ELASTICSEARCH_PASSWORD = elasticsearchPassword();
