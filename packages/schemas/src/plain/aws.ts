import { StringEnvVarSchema, type StringEnvVarSchemaInput } from "@e-n-v/core";
import { string, lengthBetween, minLength, pattern } from "@e-n-v/core";
import {
  constraints,
  descriptions,
  attributes,
  patterns,
} from "../shared/infrastructure";

export const awsAccessKeyId = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.awsAccessKeyId,
    process: string(
      lengthBetween(constraints.awsAccessKeyIdMin, constraints.awsAccessKeyIdMax)
    ),
    secret: true,
    ...input,
  });

export const awsSecretAccessKey = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.awsSecretAccessKey,
    process: string(minLength(1, attributes.awsSecretAccessKeyRequired)),
    secret: true,
    ...input,
  });

export const awsRegion = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.awsRegion,
    process: string(pattern(patterns.awsRegion, attributes.awsRegionFormat)),
    ...input,
  });

export const awsS3BucketName = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.awsS3BucketName,
    process: string(pattern(patterns.awsS3BucketName, attributes.awsS3BucketNameFormat)),
    ...input,
  });

export const awsSqsQueueUrl = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.awsSqsQueueUrl,
    process: string(pattern(patterns.awsSqsQueueUrl, attributes.awsSqsQueueUrlFormat)),
    ...input,
  });

export const AWS_ACCESS_KEY_ID = awsAccessKeyId();
export const AWS_SECRET_ACCESS_KEY = awsSecretAccessKey();
export const AWS_REGION = awsRegion();
export const AWS_S3_BUCKET_NAME = awsS3BucketName();
export const AWS_SQS_QUEUE_URL = awsSqsQueueUrl();
