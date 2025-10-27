import {
  StringEnvVarSchema,
  type StringEnvVarSchemaInput,
} from "@e-n-v/core";
import { createZodProcessor } from "../helpers/createZodProcesor";
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
    process: createZodProcessor(
      z
        .string()
        .min(constraints.awsAccessKeyIdMin, {
          message: messages.awsAccessKeyIdMin,
        })
        .max(constraints.awsAccessKeyIdMax, {
          message: messages.awsAccessKeyIdMax,
        }),
    ),
    secret: true,
    ...input,
  });

export const awsSecretAccessKey = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.awsSecretAccessKey,
    process: createZodProcessor(
      z.string().min(1, { message: messages.awsSecretAccessKeyRequired }),
    ),
    secret: true,
    ...input,
  });

export const awsRegion = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.awsRegion,
    process: createZodProcessor(
      z
        .string()
        .regex(patterns.awsRegion, { message: messages.awsRegionFormat }),
    ),
    ...input,
  });

export const awsS3BucketName = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.awsS3BucketName,
    process: createZodProcessor(
      z.string().regex(patterns.awsS3BucketName, {
        message: messages.awsS3BucketNameFormat,
      }),
    ),
    ...input,
  });

export const awsSqsQueueUrl = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.awsSqsQueueUrl,
    process: createZodProcessor(
      z.string().regex(patterns.awsSqsQueueUrl, {
        message: messages.awsSqsQueueUrlFormat,
      }),
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
