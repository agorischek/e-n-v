import { StringEnvVarSchema, type StringEnvVarSchemaInput } from "../../../envcredible-core/src";
import { processWithZodSchema } from "@envcredible/converters";
import { z } from "zod";
import {
  constraints,
  descriptions,
  messages,
  patterns,
} from "../shared/infrastructure";

export const awsAccessKeyId = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.awsAccessKeyId,
    process: processWithZodSchema<string>(
      z.string()
        .min(constraints.awsAccessKeyIdMin, { message: messages.awsAccessKeyIdMin })
        .max(constraints.awsAccessKeyIdMax, { message: messages.awsAccessKeyIdMax }),
      "string"
    ),
    secret: true,
    ...input,
  });

export const awsSecretAccessKey = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.awsSecretAccessKey,
    process: processWithZodSchema<string>(
      z.string().min(1, { message: messages.awsSecretAccessKeyRequired }),
      "string"
    ),
    secret: true,
    ...input,
  });

export const awsRegion = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.awsRegion,
    process: processWithZodSchema<string>(
      z.string().regex(patterns.awsRegion, { message: messages.awsRegionFormat }),
      "string"
    ),
    ...input,
  });

export const awsS3BucketName = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.awsS3BucketName,
    process: processWithZodSchema<string>(
      z.string().regex(patterns.awsS3BucketName, { message: messages.awsS3BucketNameFormat }),
      "string"
    ),
    ...input,
  });

export const awsSqsQueueUrl = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.awsSqsQueueUrl,
    process: processWithZodSchema<string>(
      z.string().regex(patterns.awsSqsQueueUrl, { message: messages.awsSqsQueueUrlFormat }),
      "string"
    ),
    ...input,
  });

export const AWS_ACCESS_KEY_ID = awsAccessKeyId();
export const AWS_SECRET_ACCESS_KEY = awsSecretAccessKey();
export const AWS_REGION = awsRegion();
export const AWS_S3_BUCKET_NAME = awsS3BucketName();
export const AWS_SQS_QUEUE_URL = awsSqsQueueUrl();

export const aws = {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  AWS_S3_BUCKET_NAME,
  AWS_SQS_QUEUE_URL,
} as const;