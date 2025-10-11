import { z } from "zod";
import { RABBITMQ_URL_PATTERN } from "../../../shared/patterns";
import { INFRASTRUCTURE_DESCRIPTIONS, INFRASTRUCTURE_MESSAGES } from "../../../shared/infrastructure";

const schema = z
  .string()
  .describe(INFRASTRUCTURE_DESCRIPTIONS.RABBITMQ_URL)
  .regex(RABBITMQ_URL_PATTERN, {
    error: INFRASTRUCTURE_MESSAGES.RABBITMQ_URL_FORMAT,
  });

export const rabbitmqUrlSchema = schema;
export const RABBITMQ_URL = rabbitmqUrlSchema;
