import { z } from "zod";
import { SENTRY_DSN_PATTERN } from "../../../shared/patterns";
import { INFRASTRUCTURE_DESCRIPTIONS, INFRASTRUCTURE_MESSAGES } from "../../../shared/infrastructure";

const schema = z
  .string()
  .describe(INFRASTRUCTURE_DESCRIPTIONS.SENTRY_DSN)
  .regex(SENTRY_DSN_PATTERN, {
    error: INFRASTRUCTURE_MESSAGES.SENTRY_DSN_FORMAT,
  })
  .optional();

export const sentryDsnSchema = schema;
export const SENTRY_DSN = sentryDsnSchema;
