import { z } from "zod";
import { HTTP_PROTOCOL_PATTERN } from "../../../shared/patterns";
import { INFRASTRUCTURE_DESCRIPTIONS, INFRASTRUCTURE_MESSAGES } from "../../../shared/infrastructure";

const schema = z
  .url({ message: INFRASTRUCTURE_MESSAGES.ELASTICSEARCH_URL_FORMAT })
  .describe(INFRASTRUCTURE_DESCRIPTIONS.ELASTICSEARCH_URL)
  .regex(HTTP_PROTOCOL_PATTERN, { error: INFRASTRUCTURE_MESSAGES.ELASTICSEARCH_URL_PROTOCOL });

export const elasticsearchUrlSchema = schema;
export const ELASTICSEARCH_URL = elasticsearchUrlSchema;
