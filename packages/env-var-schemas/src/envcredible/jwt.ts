import { StringEnvVarSchema, type StringEnvVarSchemaInput } from "../../../envcredible-core/src";
import { createZodProcessor } from "../helpers/zodHelpers";
import { z } from "zod";
import { patterns } from "../shared/apiService";
import {
  constraints,
  defaults,
  descriptions,
  messages,
} from "../shared/apiService";

export const jwtSecret = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.jwtSecret,
    process: createZodProcessor(
      z.string().min(constraints.jwtSecretMinLength, { message: messages.jwtSecretMin }),
    ),
    secret: true,
    ...input,
  });

export const jwtAccessTokenExpiresIn = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.jwtAccessTokenExpiresIn,
    default: defaults.jwtAccessTokenExpiresIn,
    process: createZodProcessor(
      z.string().regex(patterns.jwtTokenDuration, { message: messages.jwtDurationFormat }),
    ),
    ...input,
  });

export const jwtRefreshTokenExpiresIn = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.jwtRefreshTokenExpiresIn,
    default: defaults.jwtRefreshTokenExpiresIn,
    process: createZodProcessor(
      z.string().regex(patterns.jwtTokenDuration, { message: messages.jwtDurationFormat }),
    ),
    ...input,
  });

export const JWT_SECRET = jwtSecret();
export const JWT_ACCESS_TOKEN_EXPIRES_IN = jwtAccessTokenExpiresIn();
export const JWT_REFRESH_TOKEN_EXPIRES_IN = jwtRefreshTokenExpiresIn();

export const jwt = {
  JWT_SECRET,
  JWT_ACCESS_TOKEN_EXPIRES_IN,
  JWT_REFRESH_TOKEN_EXPIRES_IN,
} as const;