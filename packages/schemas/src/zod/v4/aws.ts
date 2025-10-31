import {
  constraints,
  descriptions,
  messages,
  patterns,
} from "../../shared/infrastructure";
import type { ZodSingleton } from "./types";

export const awsAccessKeyId = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.awsAccessKeyId)
    .min(constraints.awsAccessKeyIdMin, { error: messages.awsAccessKeyIdMin })
    .max(constraints.awsAccessKeyIdMax, { error: messages.awsAccessKeyIdMax });

export const awsSecretAccessKey = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.awsSecretAccessKey)
    .min(1, { error: messages.awsSecretAccessKeyRequired });

export const awsRegion = (z: ZodSingleton) =>
  z.string().describe(descriptions.awsRegion).regex(patterns.awsRegion, {
    error: messages.awsRegionFormat,
  });

export const awsS3BucketName = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.awsS3BucketName)
    .regex(patterns.awsS3BucketName, {
      error: messages.awsS3BucketNameFormat,
    });

export const awsSqsQueueUrl = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.awsSqsQueueUrl)
    .regex(patterns.awsSqsQueueUrl, {
      error: messages.awsSqsQueueUrlFormat,
    });
