import { z } from "zod";
import {
  APPLICATION_INSIGHTS_DEFAULTS,
  APPLICATION_INSIGHTS_DESCRIPTIONS,
} from "../../../shared/applicationInsights";

const schema = z
  .boolean()
  .describe(APPLICATION_INSIGHTS_DESCRIPTIONS.AUTO_COLLECT_CONSOLE)
  .default(APPLICATION_INSIGHTS_DEFAULTS.AUTO_COLLECT_CONSOLE);

export const appInsightsAutocollectConsoleSchema = schema;
export const APPINSIGHTS_AUTOCOLLECT_CONSOLE = appInsightsAutocollectConsoleSchema;
