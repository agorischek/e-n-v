import { z } from "zod";
import { JWT_TOKEN_DURATION_PATTERN } from "../../shared/patterns";
import { defaults, descriptions, messages } from "../../shared/apiService";

const schema = z
  .string()
  .describe(descriptions.jwtAccessTokenExpiresIn)
  .regex(JWT_TOKEN_DURATION_PATTERN, { error: messages.jwtDurationFormat })
  .default(defaults.jwtAccessTokenExpiresIn);

export const jwtAccessTokenExpiresInSchema = schema;
export const JWT_ACCESS_TOKEN_EXPIRES_IN = jwtAccessTokenExpiresInSchema;
