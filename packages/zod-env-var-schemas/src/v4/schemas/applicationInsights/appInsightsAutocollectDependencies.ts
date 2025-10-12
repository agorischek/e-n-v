import { z } from "zod";
import {
  defaults,
  descriptions,
} from "../../../shared/applicationInsights";

const schema = z
  .boolean()
  .describe(descriptions.autoCollectDependencies)
  .default(defaults.autoCollectDependencies);

export const appInsightsAutocollectDependenciesSchema = schema;
export const APPINSIGHTS_AUTOCOLLECT_DEPENDENCIES = appInsightsAutocollectDependenciesSchema;
