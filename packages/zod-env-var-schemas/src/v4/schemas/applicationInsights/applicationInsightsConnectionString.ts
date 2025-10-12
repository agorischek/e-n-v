import { z } from "zod";
import {
  descriptions,
  messages,
  patterns,
} from "../../../shared/applicationInsights";

const schema = z
  .string()
  .describe(descriptions.connectionString)
  .regex(patterns.connectionString, {
    error: messages.connectionStringFormat,
  });

export const applicationInsightsConnectionStringSchema = schema;
export const APPLICATIONINSIGHTS_CONNECTION_STRING = applicationInsightsConnectionStringSchema;
