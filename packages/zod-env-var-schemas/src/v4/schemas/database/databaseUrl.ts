import { z } from "zod";
import { GENERIC_DATABASE_URL_PATTERN } from "../../../shared/patterns";
import { DATABASE_DESCRIPTIONS, DATABASE_MESSAGES } from "../../../shared/database";

const schema = z
  .string()
  .describe(DATABASE_DESCRIPTIONS.DATABASE_URL)
  .regex(GENERIC_DATABASE_URL_PATTERN, {
    error: DATABASE_MESSAGES.GENERIC_DATABASE_URL_FORMAT,
  });

export const databaseUrlSchema = schema;
export const DATABASE_URL = databaseUrlSchema;
