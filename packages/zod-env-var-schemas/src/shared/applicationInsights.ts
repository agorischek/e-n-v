export const APPLICATION_INSIGHTS_DESCRIPTIONS = {
  CONNECTION_STRING:
    "Azure Application Insights connection string",
  INSTRUMENTATION_KEY:
    "Azure Application Insights instrumentation key (legacy)",
  ROLE_NAME:
    "Application Insights role name for distributed tracing",
  SAMPLING_RATE:
    "Application Insights telemetry sampling rate (0-100)",
  AUTO_COLLECT_DEPENDENCIES:
    "Enable automatic dependency tracking in Application Insights",
  AUTO_COLLECT_EXCEPTIONS:
    "Enable automatic exception tracking in Application Insights",
  AUTO_COLLECT_CONSOLE:
    "Enable automatic console log collection in Application Insights",
  AUTO_COLLECT_PERFORMANCE:
    "Enable automatic performance counter collection in Application Insights",
} as const;

export const APPLICATION_INSIGHTS_MESSAGES = {
  CONNECTION_STRING_FORMAT: "Must be a valid Application Insights connection string format",
  INSTRUMENTATION_KEY_UUID: "Must be a valid UUID format for instrumentation key",
  ROLE_NAME_MIN: "Role name cannot be empty",
  ROLE_NAME_MAX: "Role name must be less than 256 characters",
  SAMPLING_RATE_MIN: "Sampling rate must be between 0 and 100",
  SAMPLING_RATE_MAX: "Sampling rate must be between 0 and 100",
} as const;

export const APPLICATION_INSIGHTS_LIMITS = {
  ROLE_NAME_MIN: 1,
  ROLE_NAME_MAX: 256,
  SAMPLING_RATE_MIN: 0,
  SAMPLING_RATE_MAX: 100,
} as const;

export const APPLICATION_INSIGHTS_DEFAULTS = {
  SAMPLING_RATE: 100,
  AUTO_COLLECT_DEPENDENCIES: true,
  AUTO_COLLECT_EXCEPTIONS: true,
  AUTO_COLLECT_CONSOLE: true,
  AUTO_COLLECT_PERFORMANCE: true,
} as const;
