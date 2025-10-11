import { z } from "zod";
import { AWS_REGION_PATTERN } from "../../../shared/patterns";
import { INFRASTRUCTURE_DESCRIPTIONS, INFRASTRUCTURE_MESSAGES } from "../../../shared/infrastructure";

const schema = z
  .string()
  .describe(INFRASTRUCTURE_DESCRIPTIONS.AWS_REGION)
  .regex(AWS_REGION_PATTERN, {
    error: INFRASTRUCTURE_MESSAGES.AWS_REGION_FORMAT,
  });

export const awsRegionSchema = schema;
export const AWS_REGION = awsRegionSchema;
