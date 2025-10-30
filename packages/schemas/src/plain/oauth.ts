import { StringEnvVarSchema, type StringEnvVarSchemaInput } from "@e-n-v/core";
import { string, minLength, url } from "../helpers/validators";
import { attributes, constraints, descriptions } from "../shared/oauth";

export const oauthClientId = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.clientId,
    process: string(
      minLength(constraints.clientIdMinLength, attributes.clientIdRequired)
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
      minLength(constraints.clientSecretMinLength, attributes.clientSecretMinLength)
    ),
    secret: true,
    ...input,
  });

export const oauthRedirectUri = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.redirectUri,
    process: string(url(attributes.redirectUriInvalid)),
    ...input,
  });

export const oauthScope = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.scope,
    process: string(
      minLength(constraints.scopeMinLength, attributes.scopeRequired)
    ),
    ...input,
  });

export const OAUTH_CLIENT_ID = oauthClientId();
export const OAUTH_CLIENT_SECRET = oauthClientSecret();
export const OAUTH_REDIRECT_URI = oauthRedirectUri();
export const OAUTH_SCOPE = oauthScope();

export const oauth = {
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  OAUTH_REDIRECT_URI,
  OAUTH_SCOPE,
} as const;
