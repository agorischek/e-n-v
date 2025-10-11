import { z } from "zod";
import { INFRASTRUCTURE_DESCRIPTIONS, INFRASTRUCTURE_MESSAGES } from "../../../shared/infrastructure";

const schema = z
  .string()
  .describe(INFRASTRUCTURE_DESCRIPTIONS.KAFKA_CLIENT_ID)
  .min(1, { error: INFRASTRUCTURE_MESSAGES.KAFKA_CLIENT_ID_REQUIRED });

export const kafkaClientIdSchema = schema;
export const KAFKA_CLIENT_ID = kafkaClientIdSchema;
