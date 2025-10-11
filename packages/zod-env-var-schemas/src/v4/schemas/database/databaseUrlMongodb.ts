import { z } from "zod";
import { MONGODB_URL_PATTERN } from "../../../shared/patterns";
import { DATABASE_DESCRIPTIONS, DATABASE_MESSAGES } from "../../../shared/database";

const schema = z
  .string()
  .describe(DATABASE_DESCRIPTIONS.DATABASE_URL_MONGODB)
  .regex(MONGODB_URL_PATTERN, {
    error: DATABASE_MESSAGES.DATABASE_URL_MONGODB_FORMAT,
  });

export const databaseUrlMongodbSchema = schema;
export const DATABASE_URL_MONGODB = databaseUrlMongodbSchema;
