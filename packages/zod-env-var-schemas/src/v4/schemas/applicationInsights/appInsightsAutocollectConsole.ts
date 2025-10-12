import { z } from "zod";
import {
  defaults,
  descriptions,
} from "../../../shared/applicationInsights";

const schema = z
  .boolean()
  .describe(descriptions.autoCollectConsole)
  .default(defaults.autoCollectConsole);

export const appInsightsAutocollectConsoleSchema = schema;
export const APPINSIGHTS_AUTOCOLLECT_CONSOLE = appInsightsAutocollectConsoleSchema;
