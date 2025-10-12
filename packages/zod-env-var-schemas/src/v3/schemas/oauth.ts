import { z } from "zod";
import { constraints, descriptions, messages } from "../../shared/oauth";

export const oauthClientId = () =>
  z
    .string()
    .describe(descriptions.clientId)
    .min(constraints.clientIdMinLength, { error: messages.clientIdRequired });

export const oauthClientSecret = () =>
  z
    .string()
    .describe(descriptions.clientSecret)
    .min(constraints.clientSecretMinLength, { error: messages.clientSecretMinLength });

export const oauthRedirectUri = () =>
  z
    .string()
    .describe(descriptions.redirectUri)
    .url({ error: messages.redirectUriInvalid });

export const oauthScope = () =>
  z
    .string()
    .describe(descriptions.scope)
    .min(constraints.scopeMinLength, { error: messages.scopeRequired });

export const OAUTH_CLIENT_ID = oauthClientId();
export const OAUTH_CLIENT_SECRET = oauthClientSecret();
export const OAUTH_REDIRECT_URI = oauthRedirectUri();
export const OAUTH_SCOPE = oauthScope();

export const oauthSchemas = {
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  OAUTH_REDIRECT_URI,
  OAUTH_SCOPE,
} as const;
