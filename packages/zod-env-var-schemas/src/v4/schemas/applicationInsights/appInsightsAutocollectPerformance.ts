import { z } from "zod";
import {
  defaults,
  descriptions,
} from "../../../shared/applicationInsights";

const schema = z
  .boolean()
  .describe(descriptions.autoCollectPerformance)
  .default(defaults.autoCollectPerformance);

export const appInsightsAutocollectPerformanceSchema = schema;
export const APPINSIGHTS_AUTOCOLLECT_PERFORMANCE = appInsightsAutocollectPerformanceSchema;
