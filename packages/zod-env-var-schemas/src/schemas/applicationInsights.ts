import { z } from "zod";

/**
 * Validates Azure Application Insights connection string format
 * Expected format: InstrumentationKey=00000000-0000-0000-0000-000000000000;IngestionEndpoint=https://region.in.applicationinsights.azure.com/;LiveEndpoint=https://region.livediagnostics.monitor.azure.com/
 */
export const APPLICATIONINSIGHTS_CONNECTION_STRING = z
  .string()
  .describe("Azure Application Insights connection string")
  .regex(
    /^InstrumentationKey=[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12};IngestionEndpoint=https:\/\/[^;]+;LiveEndpoint=https:\/\/[^;]+$/,
    "Must be a valid Application Insights connection string format"
  );

/**
 * Validates Azure Application Insights instrumentation key (legacy format)
 * Format: 00000000-0000-0000-0000-000000000000
 */
export const APPINSIGHTS_INSTRUMENTATIONKEY = z
  .string()
  .describe("Azure Application Insights instrumentation key (legacy)")
  .uuid("Must be a valid UUID format for instrumentation key");

/**
 * Application Insights role name for distributed tracing
 */
export const APPINSIGHTS_ROLE_NAME = z
  .string()
  .describe("Application Insights role name for distributed tracing")
  .min(1, "Role name cannot be empty")
  .max(256, "Role name must be less than 256 characters");

/**
 * Application Insights sampling rate (0-100)
 */
export const APPINSIGHTS_SAMPLING_RATE = z
  .number()
  .describe("Application Insights telemetry sampling rate (0-100)")
  .min(0, "Sampling rate must be between 0 and 100")
  .max(100, "Sampling rate must be between 0 and 100")
  .default(100);

/**
 * Enable/disable Application Insights auto collection of dependencies
 */
export const APPINSIGHTS_AUTOCOLLECT_DEPENDENCIES = z
  .boolean()
  .describe("Enable automatic dependency tracking in Application Insights")
  .default(true);

/**
 * Enable/disable Application Insights auto collection of exceptions
 */
export const APPINSIGHTS_AUTOCOLLECT_EXCEPTIONS = z
  .boolean()
  .describe("Enable automatic exception tracking in Application Insights")
  .default(true);

/**
 * Enable/disable Application Insights auto collection of console logs
 */
export const APPINSIGHTS_AUTOCOLLECT_CONSOLE = z
  .boolean()
  .describe("Enable automatic console log collection in Application Insights")
  .default(true);

/**
 * Enable/disable Application Insights auto collection of performance counters
 */
export const APPINSIGHTS_AUTOCOLLECT_PERFORMANCE = z
  .boolean()
  .describe("Enable automatic performance counter collection in Application Insights")
  .default(true);

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
};