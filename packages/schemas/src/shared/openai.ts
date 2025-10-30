export const descriptions = {
  apiKey: "OpenAI API key for authenticating requests",
  organizationId: "OpenAI organization identifier (org-...)",
  projectId: "OpenAI project identifier (proj_...)",
  baseUrl: "Custom base URL for OpenAI-compatible API endpoints",
  model: "Default OpenAI model identifier to use for requests",
  timeout: "Request timeout in seconds for OpenAI API calls",
} as const;

export const attributes = {
  apiKeyMinLength: "at least 40 characters",
  // Pattern can return multiple requirements as array items
  apiKeyFormat: [
    "start with 'sk-'",
    "contain only letters and numbers"
  ],
  organizationFormat: "start with 'org-'",
  projectFormat: "start with 'proj_'",
  baseUrlInvalid: "a valid URL",
  baseUrlProtocol: "use https://",
  modelRequired: "OpenAI model identifier cannot be empty",
  timeoutInteger: "an integer value",
  timeoutMin: "at least 1 second",
  timeoutMax: "600 seconds or less",
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
  apiKey: /^sk-[A-Za-z0-9]{20,}$/,
  organizationId: /^org-[A-Za-z0-9_-]{8,}$/,
  projectId: /^proj_[A-Za-z0-9_-]{8,}$/,
} as const;
