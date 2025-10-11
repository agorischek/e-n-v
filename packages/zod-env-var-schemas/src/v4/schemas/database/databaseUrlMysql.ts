import { z } from "zod";
import { MYSQL_URL_PATTERN } from "../../../shared/patterns";
import { DATABASE_DESCRIPTIONS, DATABASE_MESSAGES } from "../../../shared/database";

const schema = z
  .string()
  .describe(DATABASE_DESCRIPTIONS.DATABASE_URL_MYSQL)
  .regex(MYSQL_URL_PATTERN, {
    error: DATABASE_MESSAGES.DATABASE_URL_MYSQL_FORMAT,
  });

export const databaseUrlMysqlSchema = schema;
export const DATABASE_URL_MYSQL = databaseUrlMysqlSchema;
