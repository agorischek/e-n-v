import { z } from "zod";
import { INFRASTRUCTURE_DESCRIPTIONS } from "../../../shared/infrastructure";

const schema = z
  .string()
  .describe(INFRASTRUCTURE_DESCRIPTIONS.ELASTICSEARCH_USERNAME)
  .optional();

export const elasticsearchUsernameSchema = schema;
export const ELASTICSEARCH_USERNAME = elasticsearchUsernameSchema;
