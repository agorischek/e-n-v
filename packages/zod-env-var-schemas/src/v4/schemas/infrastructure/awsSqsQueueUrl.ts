import { z } from "zod";
import { AWS_SQS_QUEUE_URL_PATTERN } from "../../../shared/patterns";
import { INFRASTRUCTURE_DESCRIPTIONS, INFRASTRUCTURE_MESSAGES } from "../../../shared/infrastructure";

const schema = z
  .string()
  .describe(INFRASTRUCTURE_DESCRIPTIONS.AWS_SQS_QUEUE_URL)
  .regex(AWS_SQS_QUEUE_URL_PATTERN, {
    error: INFRASTRUCTURE_MESSAGES.AWS_SQS_QUEUE_URL_FORMAT,
  });

export const awsSqsQueueUrlSchema = schema;
export const AWS_SQS_QUEUE_URL = awsSqsQueueUrlSchema;
