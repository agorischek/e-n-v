import { patterns } from "../../shared/apiService";
import {
  constraints,
  defaults,
  descriptions,
  messages,
} from "../../shared/apiService";
import type { ZodSingleton } from "./types";

export const jwtSecret = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.jwtSecret)
    .min(constraints.jwtSecretMinLength, { error: messages.jwtSecretMin });

export const jwtAccessTokenExpiresIn = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.jwtAccessTokenExpiresIn)
    .regex(patterns.jwtTokenDuration, { error: messages.jwtDurationFormat })
    .default(defaults.jwtAccessTokenExpiresIn);

export const jwtRefreshTokenExpiresIn = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.jwtRefreshTokenExpiresIn)
    .regex(patterns.jwtTokenDuration, { error: messages.jwtDurationFormat })
    .default(defaults.jwtRefreshTokenExpiresIn);
