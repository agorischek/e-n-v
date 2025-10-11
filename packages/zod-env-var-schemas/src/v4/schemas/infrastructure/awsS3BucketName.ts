import { z } from "zod";
import { AWS_S3_BUCKET_NAME_PATTERN } from "../../../shared/patterns";
import { INFRASTRUCTURE_DESCRIPTIONS, INFRASTRUCTURE_MESSAGES } from "../../../shared/infrastructure";

const schema = z
  .string()
  .describe(INFRASTRUCTURE_DESCRIPTIONS.AWS_S3_BUCKET_NAME)
  .regex(AWS_S3_BUCKET_NAME_PATTERN, {
    error: INFRASTRUCTURE_MESSAGES.AWS_S3_BUCKET_NAME_FORMAT,
  });

export const awsS3BucketNameSchema = schema;
export const AWS_S3_BUCKET_NAME = awsS3BucketNameSchema;
