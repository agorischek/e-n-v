import { z } from "zod";
import {
  APPLICATION_INSIGHTS_DEFAULTS,
  APPLICATION_INSIGHTS_DESCRIPTIONS,
} from "../../../shared/applicationInsights";

const schema = z
  .boolean()
  .describe(APPLICATION_INSIGHTS_DESCRIPTIONS.AUTO_COLLECT_DEPENDENCIES)
  .default(APPLICATION_INSIGHTS_DEFAULTS.AUTO_COLLECT_DEPENDENCIES);

export const appInsightsAutocollectDependenciesSchema = schema;
export const APPINSIGHTS_AUTOCOLLECT_DEPENDENCIES = appInsightsAutocollectDependenciesSchema;
