import { APPLICATIONINSIGHTS_CONNECTION_STRING } from "./applicationInsightsConnectionString";
import { APPINSIGHTS_INSTRUMENTATIONKEY } from "./appInsightsInstrumentationKey";
import { APPINSIGHTS_ROLE_NAME } from "./appInsightsRoleName";
import { APPINSIGHTS_SAMPLING_RATE } from "./appInsightsSamplingRate";
import { APPINSIGHTS_AUTOCOLLECT_DEPENDENCIES } from "./appInsightsAutocollectDependencies";
import { APPINSIGHTS_AUTOCOLLECT_EXCEPTIONS } from "./appInsightsAutocollectExceptions";
import { APPINSIGHTS_AUTOCOLLECT_CONSOLE } from "./appInsightsAutocollectConsole";
import { APPINSIGHTS_AUTOCOLLECT_PERFORMANCE } from "./appInsightsAutocollectPerformance";

export { applicationInsightsConnectionStringSchema, APPLICATIONINSIGHTS_CONNECTION_STRING } from "./applicationInsightsConnectionString";
export { appInsightsInstrumentationKeySchema, APPINSIGHTS_INSTRUMENTATIONKEY } from "./appInsightsInstrumentationKey";
export { appInsightsRoleNameSchema, APPINSIGHTS_ROLE_NAME } from "./appInsightsRoleName";
export { appInsightsSamplingRateSchema, APPINSIGHTS_SAMPLING_RATE } from "./appInsightsSamplingRate";
export {
  appInsightsAutocollectDependenciesSchema,
  APPINSIGHTS_AUTOCOLLECT_DEPENDENCIES,
} from "./appInsightsAutocollectDependencies";
export {
  appInsightsAutocollectExceptionsSchema,
  APPINSIGHTS_AUTOCOLLECT_EXCEPTIONS,
} from "./appInsightsAutocollectExceptions";
export { appInsightsAutocollectConsoleSchema, APPINSIGHTS_AUTOCOLLECT_CONSOLE } from "./appInsightsAutocollectConsole";
export {
  appInsightsAutocollectPerformanceSchema,
  APPINSIGHTS_AUTOCOLLECT_PERFORMANCE,
} from "./appInsightsAutocollectPerformance";

export const applicationInsightsSchemas = {
  APPLICATIONINSIGHTS_CONNECTION_STRING,
  APPINSIGHTS_INSTRUMENTATIONKEY,
  APPINSIGHTS_ROLE_NAME,
  APPINSIGHTS_SAMPLING_RATE,
  APPINSIGHTS_AUTOCOLLECT_DEPENDENCIES,
  APPINSIGHTS_AUTOCOLLECT_EXCEPTIONS,
  APPINSIGHTS_AUTOCOLLECT_CONSOLE,
  APPINSIGHTS_AUTOCOLLECT_PERFORMANCE,
} as const;
