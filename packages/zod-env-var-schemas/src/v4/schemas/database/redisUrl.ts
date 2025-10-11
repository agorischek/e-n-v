import { z } from "zod";
import { REDIS_URL_PATTERN } from "../../../shared/patterns";
import { DATABASE_DESCRIPTIONS, DATABASE_MESSAGES } from "../../../shared/database";

const schema = z
  .string()
  .describe(DATABASE_DESCRIPTIONS.REDIS_URL)
  .regex(REDIS_URL_PATTERN, {
    error: DATABASE_MESSAGES.REDIS_URL_FORMAT,
  });

export const redisUrlSchema = schema;
export const REDIS_URL = redisUrlSchema;
