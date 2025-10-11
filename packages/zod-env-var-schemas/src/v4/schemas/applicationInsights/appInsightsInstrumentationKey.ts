import { z } from "zod";
import {
  APPLICATION_INSIGHTS_DESCRIPTIONS,
  APPLICATION_INSIGHTS_MESSAGES,
} from "../../../shared/applicationInsights";

const schema = z
  .string()
  .describe(APPLICATION_INSIGHTS_DESCRIPTIONS.INSTRUMENTATION_KEY)
  .uuid({ error: APPLICATION_INSIGHTS_MESSAGES.INSTRUMENTATION_KEY_UUID });

export const appInsightsInstrumentationKeySchema = schema;
export const APPINSIGHTS_INSTRUMENTATIONKEY = appInsightsInstrumentationKeySchema;
