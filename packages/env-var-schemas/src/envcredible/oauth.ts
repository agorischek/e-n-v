import { StringEnvVarSchema, type StringEnvVarSchemaInput } from "../../../envcredible-core/src";
import { processWithZodSchema } from "@envcredible/converters";
import { z } from "zod";
import { constraints, descriptions, messages } from "../shared/oauth";

export const oauthClientId = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.clientId,
    process: processWithZodSchema<string>(
      z.string().min(constraints.clientIdMinLength, { message: messages.clientIdRequired }),
      "string"
    ),
    secret: true,
    ...input,
  });

export const oauthClientSecret = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.clientSecret,
    process: processWithZodSchema<string>(
      z.string().min(constraints.clientSecretMinLength, {
        message: messages.clientSecretMinLength,
      }),
      "string"
    ),
    secret: true,
    ...input,
  });

export const oauthRedirectUri = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.redirectUri,
    process: processWithZodSchema<string>(
      z.string().url({ message: messages.redirectUriInvalid }),
      "string"
    ),
    ...input,
  });

export const oauthScope = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.scope,
    process: processWithZodSchema<string>(
      z.string().min(constraints.scopeMinLength, { message: messages.scopeRequired }),
      "string"
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