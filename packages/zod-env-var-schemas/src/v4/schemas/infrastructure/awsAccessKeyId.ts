import { z } from "zod";
import {
  INFRASTRUCTURE_DESCRIPTIONS,
  INFRASTRUCTURE_LIMITS,
  INFRASTRUCTURE_MESSAGES,
} from "../../../shared/infrastructure";

const schema = z
  .string()
  .describe(INFRASTRUCTURE_DESCRIPTIONS.AWS_ACCESS_KEY_ID)
  .min(INFRASTRUCTURE_LIMITS.AWS_ACCESS_KEY_ID_MIN, { error: INFRASTRUCTURE_MESSAGES.AWS_ACCESS_KEY_ID_MIN })
  .max(INFRASTRUCTURE_LIMITS.AWS_ACCESS_KEY_ID_MAX, { error: INFRASTRUCTURE_MESSAGES.AWS_ACCESS_KEY_ID_MAX });

export const awsAccessKeyIdSchema = schema;
export const AWS_ACCESS_KEY_ID = awsAccessKeyIdSchema;
