import { z } from "zod";
import { JWT_TOKEN_DURATION_PATTERN } from "../../../shared/patterns";
import { API_SERVICE_DEFAULTS, API_SERVICE_DESCRIPTIONS, API_SERVICE_MESSAGES } from "../../../shared/apiService";

const schema = z
  .string()
  .describe(API_SERVICE_DESCRIPTIONS.JWT_REFRESH_TOKEN_EXPIRES_IN)
  .regex(JWT_TOKEN_DURATION_PATTERN, { error: API_SERVICE_MESSAGES.JWT_DURATION_FORMAT })
  .default(API_SERVICE_DEFAULTS.JWT_REFRESH_TOKEN_EXPIRES_IN);

export const jwtRefreshTokenExpiresInSchema = schema;
export const JWT_REFRESH_TOKEN_EXPIRES_IN = jwtRefreshTokenExpiresInSchema;
