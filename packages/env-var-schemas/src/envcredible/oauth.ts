import {
  StringEnvVarSchema,
  type StringEnvVarSchemaInput,
} from "../../../envcredible-core/src";
import { createZodProcessor } from "../helpers/createZodProcesor";
import { z } from "zod";
import { constraints, descriptions, messages } from "../shared/oauth";

export const oauthClientId = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.clientId,
    process: createZodProcessor(
      z
        .string()
        .min(constraints.clientIdMinLength, {
          message: messages.clientIdRequired,
        }),
    ),
    secret: true,
    ...input,
  });

export const oauthClientSecret = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.clientSecret,
    process: createZodProcessor(
      z.string().min(constraints.clientSecretMinLength, {
        message: messages.clientSecretMinLength,
      }),
    ),
    secret: true,
    ...input,
  });

export const oauthRedirectUri = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.redirectUri,
    process: createZodProcessor(
      z.string().url({ message: messages.redirectUriInvalid }),
    ),
    ...input,
  });

export const oauthScope = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.scope,
    process: createZodProcessor(
      z
        .string()
        .min(constraints.scopeMinLength, { message: messages.scopeRequired }),
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
