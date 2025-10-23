import { z } from "zod";
import { patterns } from "../../shared/apiService";
import {
  constraints,
  defaults,
  descriptions,
  messages,
} from "../../shared/apiService";

export const jwtSecret = () =>
  z
    .string()
    .describe(descriptions.jwtSecret)
    .min(constraints.jwtSecretMinLength, { error: messages.jwtSecretMin });

export const jwtAccessTokenExpiresIn = () =>
  z
    .string()
    .describe(descriptions.jwtAccessTokenExpiresIn)
    .regex(patterns.jwtTokenDuration, { error: messages.jwtDurationFormat })
    .default(defaults.jwtAccessTokenExpiresIn);

export const jwtRefreshTokenExpiresIn = () =>
  z
    .string()
    .describe(descriptions.jwtRefreshTokenExpiresIn)
    .regex(patterns.jwtTokenDuration, { error: messages.jwtDurationFormat })
    .default(defaults.jwtRefreshTokenExpiresIn);

export const JWT_SECRET = jwtSecret();
export const JWT_ACCESS_TOKEN_EXPIRES_IN = jwtAccessTokenExpiresIn();
export const JWT_REFRESH_TOKEN_EXPIRES_IN = jwtRefreshTokenExpiresIn();
