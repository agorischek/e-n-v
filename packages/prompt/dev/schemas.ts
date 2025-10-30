import { prompt } from "../src";
import {
  // String with multiple validators (length + pattern)
  OPENAI_API_KEY,
  // URL with custom validation (must be HTTPS)
  OPENAI_BASE_URL,
  // Number with integer + range validation
  DATABASE_POOL_SIZE,
  // Pattern validation with specific format
  JWT_ACCESS_TOKEN_EXPIRES_IN,
  // Enum validation
  NODE_ENV,
  // Custom validation logic (CORS origins)
  CORS_ORIGIN,
  // String with lengthBetween
  AWS_ACCESS_KEY_ID,
  // Pattern with complex regex
  AWS_REGION,
} from "@e-n-v/schemas";

await prompt({
  schemas: {
    OPENAI_API_KEY,
    OPENAI_BASE_URL,
    DATABASE_POOL_SIZE,
    JWT_ACCESS_TOKEN_EXPIRES_IN,
    NODE_ENV,
    CORS_ORIGIN,
    AWS_ACCESS_KEY_ID,
    AWS_REGION,
  },
});
