import { StringEnvVarSchema, type StringEnvVarSchemaInput } from "@e-n-v/core";
import { string, minLength, url } from "@e-n-v/core";
import { traits, constraints, descriptions } from "../shared/oauth";

export const oauthClientId = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.clientId,
    process: string(
      minLength(constraints.clientIdMinLength, traits.clientIdRequired),
    ),
    secret: true,
    ...input,
  });

export const oauthClientSecret = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.clientSecret,
    process: string(
      minLength(
        constraints.clientSecretMinLength,
        traits.clientSecretMinLength,
      ),
    ),
    secret: true,
    ...input,
  });

export const oauthRedirectUri = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.redirectUri,
    process: string(url(traits.redirectUriInvalid)),
    ...input,
  });

export const oauthScope = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.scope,
    process: string(
      minLength(constraints.scopeMinLength, traits.scopeRequired),
    ),
    ...input,
  });

export const OAUTH_CLIENT_ID = oauthClientId();
export const OAUTH_CLIENT_SECRET = oauthClientSecret();
export const OAUTH_REDIRECT_URI = oauthRedirectUri();
export const OAUTH_SCOPE = oauthScope();
