import { COMMON_MESSAGES } from "./messages";

export const descriptions = {
  clientId: "The OAuth client ID",
  clientSecret: "OAuth client secret",
  redirectUri: "OAuth redirect URI",
  scope: "OAuth scope (space-separated)",
} as const;

export const attributes = {
  clientIdRequired: "OAuth client ID is required",
  clientSecretMinLength:
    "at least 8 characters long",
  redirectUriInvalid: COMMON_MESSAGES.MUST_BE_VALID_URL,
  scopeRequired: "OAuth scope is required",
} as const;

export const constraints = {
  clientIdMinLength: 1,
  clientSecretMinLength: 8,
  scopeMinLength: 1,
} as const;
