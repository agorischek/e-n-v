import { z } from "zod";
import {
  constraints,
  defaults,
  descriptions,
  messages,
  patterns,
} from "../../shared/applicationInsights";

export const applicationInsightsConnectionString = () =>
  z
    .string()
    .describe(descriptions.connectionString)
    .regex(patterns.connectionString, {
      error: messages.connectionStringFormat,
    });

export const appInsightsInstrumentationKey = () =>
  z
    .uuid({ message: messages.instrumentationKeyUuid })
    .describe(descriptions.instrumentationKey);

export const appInsightsRoleName = () =>
  z
    .string()
    .describe(descriptions.roleName)
    .min(constraints.roleNameMin, { error: messages.roleNameMin })
    .max(constraints.roleNameMax, { error: messages.roleNameMax });

export const appInsightsSamplingRate = () =>
  z
    .number()
    .describe(descriptions.samplingRate)
    .min(constraints.samplingRateMin, { error: messages.samplingRateMin })
    .max(constraints.samplingRateMax, { error: messages.samplingRateMax })
    .default(defaults.samplingRate);

export const appInsightsAutocollectDependencies = () =>
  z
    .boolean()
    .describe(descriptions.autoCollectDependencies)
    .default(defaults.autoCollectDependencies);

export const appInsightsAutocollectExceptions = () =>
  z
    .boolean()
    .describe(descriptions.autoCollectExceptions)
    .default(defaults.autoCollectExceptions);

export const appInsightsAutocollectConsole = () =>
  z
    .boolean()
    .describe(descriptions.autoCollectConsole)
    .default(defaults.autoCollectConsole);

export const appInsightsAutocollectPerformance = () =>
  z
    .boolean()
    .describe(descriptions.autoCollectPerformance)
    .default(defaults.autoCollectPerformance);

export const APPLICATIONINSIGHTS_CONNECTION_STRING = applicationInsightsConnectionString();
export const APPINSIGHTS_INSTRUMENTATIONKEY = appInsightsInstrumentationKey();
export const APPINSIGHTS_ROLE_NAME = appInsightsRoleName();
export const APPINSIGHTS_SAMPLING_RATE = appInsightsSamplingRate();
export const APPINSIGHTS_AUTOCOLLECT_DEPENDENCIES = appInsightsAutocollectDependencies();
export const APPINSIGHTS_AUTOCOLLECT_EXCEPTIONS = appInsightsAutocollectExceptions();
export const APPINSIGHTS_AUTOCOLLECT_CONSOLE = appInsightsAutocollectConsole();
export const APPINSIGHTS_AUTOCOLLECT_PERFORMANCE = appInsightsAutocollectPerformance();
