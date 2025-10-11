import { z } from "zod";
import { INFRASTRUCTURE_DESCRIPTIONS } from "../../../shared/infrastructure";

const schema = z
  .string()
  .describe(INFRASTRUCTURE_DESCRIPTIONS.ELASTICSEARCH_PASSWORD)
  .optional();

export const elasticsearchPasswordSchema = schema;
export const ELASTICSEARCH_PASSWORD = elasticsearchPasswordSchema;
