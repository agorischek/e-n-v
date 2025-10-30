import { StringEnvVarSchema, type StringEnvVarSchemaInput } from "@e-n-v/core";
import { string, minLength, pattern } from "../helpers/validators";
import { patterns } from "../shared/apiService";
import {
  constraints,
  defaults,
  descriptions,
  attributes,
} from "../shared/apiService";

export const jwtSecret = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.jwtSecret,
    process: string(
      minLength(constraints.jwtSecretMinLength, attributes.jwtSecretMin)
    ),
    secret: true,
    ...input,
  });

export const jwtAccessTokenExpiresIn = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.jwtAccessTokenExpiresIn,
    default: defaults.jwtAccessTokenExpiresIn,
    process: string(
      pattern(patterns.jwtTokenDuration, attributes.jwtDurationFormat)
    ),
    ...input,
  });

export const jwtRefreshTokenExpiresIn = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.jwtRefreshTokenExpiresIn,
    default: defaults.jwtRefreshTokenExpiresIn,
    process: string(
      pattern(patterns.jwtTokenDuration, attributes.jwtDurationFormat)
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
