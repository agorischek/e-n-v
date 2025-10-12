import { z } from "zod";
import {
  defaults,
  descriptions,
  constraints,
  messages,
  patterns,
} from "../../shared/applicationInsights";

/**
 * Validates Azure Application Insights connection string format
 * Expected format: InstrumentationKey=00000000-0000-0000-0000-000000000000;IngestionEndpoint=https://region.in.applicationinsights.azure.com/;LiveEndpoint=https://region.livediagnostics.monitor.azure.com/
 */
export const APPLICATIONINSIGHTS_CONNECTION_STRING = z
  .string()
  .describe(descriptions.connectionString)
  .regex(patterns.connectionString, messages.connectionStringFormat);

/**
 * Validates Azure Application Insights instrumentation key (legacy format)
 * Format: 00000000-0000-0000-0000-000000000000
 */
export const APPINSIGHTS_INSTRUMENTATIONKEY = z
  .string()
  .describe(descriptions.instrumentationKey)
  .uuid(messages.instrumentationKeyUuid);

/**
 * Application Insights role name for distributed tracing
 */
export const APPINSIGHTS_ROLE_NAME = z
  .string()
  .describe(descriptions.roleName)
  .min(constraints.roleNameMin, messages.roleNameMin)
  .max(constraints.roleNameMax, messages.roleNameMax);

/**
 * Application Insights sampling rate (0-100)
 */
export const APPINSIGHTS_SAMPLING_RATE = z
  .number()
  .describe(descriptions.samplingRate)
  .min(constraints.samplingRateMin, messages.samplingRateMin)
  .max(constraints.samplingRateMax, messages.samplingRateMax)
  .default(defaults.samplingRate);

/**
 * Enable/disable Application Insights auto collection of dependencies
 */
export const APPINSIGHTS_AUTOCOLLECT_DEPENDENCIES = z
  .boolean()
  .describe(descriptions.autoCollectDependencies)
  .default(defaults.autoCollectDependencies);

/**
 * Enable/disable Application Insights auto collection of exceptions
 */
export const APPINSIGHTS_AUTOCOLLECT_EXCEPTIONS = z
  .boolean()
  .describe(descriptions.autoCollectExceptions)
  .default(defaults.autoCollectExceptions);

/**
 * Enable/disable Application Insights auto collection of console logs
 */
export const APPINSIGHTS_AUTOCOLLECT_CONSOLE = z
  .boolean()
  .describe(descriptions.autoCollectConsole)
  .default(defaults.autoCollectConsole);

/**
 * Enable/disable Application Insights auto collection of performance counters
 */
export const APPINSIGHTS_AUTOCOLLECT_PERFORMANCE = z
  .boolean()
  .describe(descriptions.autoCollectPerformance)
  .default(defaults.autoCollectPerformance);

/**
 * Pre-configured Application Insights schemas for common scenarios
 */
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
