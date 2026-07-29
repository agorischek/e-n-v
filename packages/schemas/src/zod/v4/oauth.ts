import { constraints, descriptions, messages } from "../../shared/oauth";
import type { ZodSingleton } from "./types";

export const oauthClientId = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.clientId)
    .min(constraints.clientIdMinLength, { error: messages.clientIdRequired });

export const oauthClientSecret = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.clientSecret)
    .min(constraints.clientSecretMinLength, {
      error: messages.clientSecretMinLength,
    });

export const oauthRedirectUri = (z: ZodSingleton) =>
  z
    .url({ message: messages.redirectUriInvalid })
    .describe(descriptions.redirectUri);

export const oauthScope = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.scope)
    .min(constraints.scopeMinLength, { error: messages.scopeRequired });
