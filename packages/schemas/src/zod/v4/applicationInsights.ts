import {
  constraints,
  defaults,
  descriptions,
  messages,
  patterns,
} from "../../shared/applicationInsights";
import type { ZodSingleton } from "./types";

export const applicationInsightsConnectionString = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.connectionString)
    .regex(patterns.connectionString, {
      error: messages.connectionStringFormat,
    });

export const appInsightsInstrumentationKey = (z: ZodSingleton) =>
  z
    .uuid({ message: messages.instrumentationKeyUuid })
    .describe(descriptions.instrumentationKey);

export const appInsightsRoleName = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.roleName)
    .min(constraints.roleNameMin, { error: messages.roleNameMin })
    .max(constraints.roleNameMax, { error: messages.roleNameMax });

export const appInsightsSamplingRate = (z: ZodSingleton) =>
  z
    .number()
    .describe(descriptions.samplingRate)
    .min(constraints.samplingRateMin, { error: messages.samplingRateMin })
    .max(constraints.samplingRateMax, { error: messages.samplingRateMax })
    .default(defaults.samplingRate);

export const appInsightsAutocollectDependencies = (z: ZodSingleton) =>
  z
    .boolean()
    .describe(descriptions.autoCollectDependencies)
    .default(defaults.autoCollectDependencies);

export const appInsightsAutocollectExceptions = (z: ZodSingleton) =>
  z
    .boolean()
    .describe(descriptions.autoCollectExceptions)
    .default(defaults.autoCollectExceptions);

export const appInsightsAutocollectConsole = (z: ZodSingleton) =>
  z
    .boolean()
    .describe(descriptions.autoCollectConsole)
    .default(defaults.autoCollectConsole);

export const appInsightsAutocollectPerformance = (z: ZodSingleton) =>
  z
    .boolean()
    .describe(descriptions.autoCollectPerformance)
    .default(defaults.autoCollectPerformance);
