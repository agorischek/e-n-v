import { z } from "zod";
import { INFRASTRUCTURE_DESCRIPTIONS, INFRASTRUCTURE_MESSAGES } from "../../../shared/infrastructure";

const schema = z
  .string()
  .describe(INFRASTRUCTURE_DESCRIPTIONS.AWS_SECRET_ACCESS_KEY)
  .min(1, { error: INFRASTRUCTURE_MESSAGES.AWS_SECRET_ACCESS_KEY_REQUIRED });

export const awsSecretAccessKeySchema = schema;
export const AWS_SECRET_ACCESS_KEY = awsSecretAccessKeySchema;
