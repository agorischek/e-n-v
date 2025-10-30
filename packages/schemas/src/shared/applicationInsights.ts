export const descriptions = {
  connectionString: "Azure Application Insights connection string",
  instrumentationKey: "Azure Application Insights instrumentation key (legacy)",
  roleName: "Application Insights role name for distributed tracing",
  samplingRate: "Application Insights telemetry sampling rate (0-100)",
  autoCollectDependencies:
    "Enable automatic dependency tracking in Application Insights",
  autoCollectExceptions:
    "Enable automatic exception tracking in Application Insights",
  autoCollectConsole:
    "Enable automatic console log collection in Application Insights",
  autoCollectPerformance:
    "Enable automatic performance counter collection in Application Insights",
} as const;

export const traits = {
  connectionStringFormat:
    "a valid Application Insights connection string format",
  instrumentationKeyUuid: "a valid UUID format for instrumentation key",
  roleNameMin: "role name cannot be empty",
  roleNameMax: "less than 256 characters",
  samplingRateMin: "between 0 and 100",
  samplingRateMax: "between 0 and 100",
} as const;

export const constraints = {
  roleNameMin: 1,
  roleNameMax: 256,
  samplingRateMin: 0,
  samplingRateMax: 100,
} as const;

export const defaults = {
  samplingRate: 100,
  autoCollectDependencies: true,
  autoCollectExceptions: true,
  autoCollectConsole: true,
  autoCollectPerformance: true,
} as const;

export const patterns = {
  connectionString:
    /^InstrumentationKey=[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12};IngestionEndpoint=https:\/\/[^;]+;LiveEndpoint=https:\/\/[^;]+$/,
} as const;
