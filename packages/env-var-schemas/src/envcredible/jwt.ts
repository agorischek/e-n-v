import { StringEnvVarSchema, type StringEnvVarSchemaInput } from "../../../envcredible-core/src";
import { processWithZodSchema } from "@envcredible/converters";
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
    process: processWithZodSchema<string>(
      z.string().min(constraints.jwtSecretMinLength, { message: messages.jwtSecretMin }),
      "string"
    ),
    secret: true,
    ...input,
  });

export const jwtAccessTokenExpiresIn = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.jwtAccessTokenExpiresIn,
    default: defaults.jwtAccessTokenExpiresIn,
    process: processWithZodSchema<string>(
      z.string().regex(patterns.jwtTokenDuration, { message: messages.jwtDurationFormat }),
      "string"
    ),
    ...input,
  });

export const jwtRefreshTokenExpiresIn = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.jwtRefreshTokenExpiresIn,
    default: defaults.jwtRefreshTokenExpiresIn,
    process: processWithZodSchema<string>(
      z.string().regex(patterns.jwtTokenDuration, { message: messages.jwtDurationFormat }),
      "string"
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