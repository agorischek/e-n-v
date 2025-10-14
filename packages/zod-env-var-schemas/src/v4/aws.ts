import { z } from "zod";
import {
  constraints,
  descriptions,
  messages,
  patterns,
} from "../shared/infrastructure";

export const awsAccessKeyId = () =>
  z
    .string()
    .describe(descriptions.awsAccessKeyId)
    .min(constraints.awsAccessKeyIdMin, { error: messages.awsAccessKeyIdMin })
    .max(constraints.awsAccessKeyIdMax, { error: messages.awsAccessKeyIdMax });

export const awsSecretAccessKey = () =>
  z
    .string()
    .describe(descriptions.awsSecretAccessKey)
    .min(1, { error: messages.awsSecretAccessKeyRequired });

export const awsRegion = () =>
  z
    .string()
    .describe(descriptions.awsRegion)
    .regex(patterns.awsRegion, {
      error: messages.awsRegionFormat,
    });

export const awsS3BucketName = () =>
  z
    .string()
    .describe(descriptions.awsS3BucketName)
    .regex(patterns.awsS3BucketName, {
      error: messages.awsS3BucketNameFormat,
    });

export const awsSqsQueueUrl = () =>
  z
    .string()
    .describe(descriptions.awsSqsQueueUrl)
    .regex(patterns.awsSqsQueueUrl, {
      error: messages.awsSqsQueueUrlFormat,
    });

export const AWS_ACCESS_KEY_ID = awsAccessKeyId();
export const AWS_SECRET_ACCESS_KEY = awsSecretAccessKey();
export const AWS_REGION = awsRegion();
export const AWS_S3_BUCKET_NAME = awsS3BucketName();
export const AWS_SQS_QUEUE_URL = awsSqsQueueUrl();