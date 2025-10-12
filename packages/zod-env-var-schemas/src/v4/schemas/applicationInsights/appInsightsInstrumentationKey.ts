import { z } from "zod";
import {
  descriptions,
  messages,
} from "../../../shared/applicationInsights";

const schema = z
  .string()
  .describe(descriptions.instrumentationKey)
  .uuid({ error: messages.instrumentationKeyUuid });

export const appInsightsInstrumentationKeySchema = schema;
export const APPINSIGHTS_INSTRUMENTATIONKEY = appInsightsInstrumentationKeySchema;
