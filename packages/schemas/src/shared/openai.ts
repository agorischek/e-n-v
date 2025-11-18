export const descriptions = {
  apiKey: "OpenAI API key for authenticating requests",
  organizationId: "OpenAI organization identifier (org-...)",
  projectId: "OpenAI project identifier (proj_...)",
  baseUrl: "Custom base URL for OpenAI-compatible API endpoints",
  model: "Default OpenAI model identifier to use for requests",
  timeout: "Request timeout in seconds for OpenAI API calls",
} as const;

export const messages = {
  apiKeyMinLength: "OpenAI API key must be at least 40 characters",
  apiKeyFormat:
    "OpenAI API key must start with 'sk-' and contain only letters, numbers, and underscores",
  organizationFormat: "OpenAI organization ID must start with 'org-'",
  projectFormat: "OpenAI project ID must start with 'proj_'",
  baseUrlInvalid: "OpenAI base URL must be a valid URL",
  baseUrlProtocol: "OpenAI base URL must use https://",
  modelRequired: "OpenAI model identifier cannot be empty",
  timeoutInteger: "OpenAI timeout must be an integer value",
  timeoutMin: "OpenAI timeout must be at least 1 second",
  timeoutMax: "OpenAI timeout must be 600 seconds or less",
} as const;

export const constraints = {
  apiKeyMinLength: 40,
  timeoutMin: 1,
  timeoutMax: 600,
} as const;

export const defaults = {
  timeout: 30,
} as const;

export const patterns = {
  apiKey: /^sk-[A-Za-z0-9_]{20,}$/,
  organizationId: /^org-[A-Za-z0-9_-]{8,}$/,
  projectId: /^proj_[A-Za-z0-9_-]{8,}$/,
} as const;
