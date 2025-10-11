import { z } from "zod";
import { HTTP_PROTOCOL_PATTERN } from "../../../shared/patterns";
import { INFRASTRUCTURE_DESCRIPTIONS, INFRASTRUCTURE_MESSAGES } from "../../../shared/infrastructure";

const schema = z
  .string()
  .describe(INFRASTRUCTURE_DESCRIPTIONS.ELASTICSEARCH_URL)
  .url({ error: INFRASTRUCTURE_MESSAGES.ELASTICSEARCH_URL_FORMAT })
  .regex(HTTP_PROTOCOL_PATTERN, { error: INFRASTRUCTURE_MESSAGES.ELASTICSEARCH_URL_PROTOCOL });

export const elasticsearchUrlSchema = schema;
export const ELASTICSEARCH_URL = elasticsearchUrlSchema;
