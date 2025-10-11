import { z } from "zod";
import { DATABASE_NAME_PATTERN } from "../../../shared/patterns";
import { DATABASE_DESCRIPTIONS, DATABASE_MESSAGES } from "../../../shared/database";

const schema = z
  .string()
  .describe(DATABASE_DESCRIPTIONS.DATABASE_NAME)
  .min(1, { error: DATABASE_MESSAGES.DATABASE_NAME_REQUIRED })
  .regex(DATABASE_NAME_PATTERN, {
    error: DATABASE_MESSAGES.DATABASE_NAME_FORMAT,
  });

export const databaseNameSchema = schema;
export const DATABASE_NAME = databaseNameSchema;
