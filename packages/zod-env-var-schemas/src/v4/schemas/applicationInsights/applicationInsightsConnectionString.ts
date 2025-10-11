import { z } from "zod";
import { APPLICATION_INSIGHTS_CONNECTION_STRING_PATTERN } from "../../../shared/patterns";
import {
  APPLICATION_INSIGHTS_DESCRIPTIONS,
  APPLICATION_INSIGHTS_MESSAGES,
} from "../../../shared/applicationInsights";

const schema = z
  .string()
  .describe(APPLICATION_INSIGHTS_DESCRIPTIONS.CONNECTION_STRING)
  .regex(APPLICATION_INSIGHTS_CONNECTION_STRING_PATTERN, {
    error: APPLICATION_INSIGHTS_MESSAGES.CONNECTION_STRING_FORMAT,
  });

export const applicationInsightsConnectionStringSchema = schema;
export const APPLICATIONINSIGHTS_CONNECTION_STRING = applicationInsightsConnectionStringSchema;
