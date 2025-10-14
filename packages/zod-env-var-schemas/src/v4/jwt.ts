import { z } from "zod";
import { JWT_TOKEN_DURATION_PATTERN } from "../shared/patterns";
import { constraints, defaults, descriptions, messages } from "../shared/apiService";

export const jwtSecret = () =>
  z
    .string()
    .describe(descriptions.jwtSecret)
    .min(constraints.jwtSecretMinLength, { error: messages.jwtSecretMin });

export const jwtAccessTokenExpiresIn = () =>
  z
    .string()
    .describe(descriptions.jwtAccessTokenExpiresIn)
    .regex(JWT_TOKEN_DURATION_PATTERN, { error: messages.jwtDurationFormat })
    .default(defaults.jwtAccessTokenExpiresIn);

export const jwtRefreshTokenExpiresIn = () =>
  z
    .string()
    .describe(descriptions.jwtRefreshTokenExpiresIn)
    .regex(JWT_TOKEN_DURATION_PATTERN, { error: messages.jwtDurationFormat })
    .default(defaults.jwtRefreshTokenExpiresIn);

export const JWT_SECRET = jwtSecret();
export const JWT_ACCESS_TOKEN_EXPIRES_IN = jwtAccessTokenExpiresIn();
export const JWT_REFRESH_TOKEN_EXPIRES_IN = jwtRefreshTokenExpiresIn();