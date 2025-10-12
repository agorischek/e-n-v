import { z } from "zod";
import {
  defaults,
  descriptions,
} from "../../../shared/applicationInsights";

const schema = z
  .boolean()
  .describe(descriptions.autoCollectExceptions)
  .default(defaults.autoCollectExceptions);

export const appInsightsAutocollectExceptionsSchema = schema;
export const APPINSIGHTS_AUTOCOLLECT_EXCEPTIONS = appInsightsAutocollectExceptionsSchema;
