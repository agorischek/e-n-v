import { z } from "zod";
import { JWT_TOKEN_DURATION_PATTERN } from "../../shared/patterns";
import { defaults, descriptions, messages } from "../../shared/apiService";

const schema = z
  .string()
  .describe(descriptions.jwtRefreshTokenExpiresIn)
  .regex(JWT_TOKEN_DURATION_PATTERN, { error: messages.jwtDurationFormat })
  .default(defaults.jwtRefreshTokenExpiresIn);

export const jwtRefreshTokenExpiresInSchema = schema;
export const JWT_REFRESH_TOKEN_EXPIRES_IN = jwtRefreshTokenExpiresInSchema;
