import { z } from "zod";
import { POSTGRES_URL_PATTERN } from "../../../shared/patterns";
import { DATABASE_DESCRIPTIONS, DATABASE_MESSAGES } from "../../../shared/database";

const schema = z
  .string()
  .describe(DATABASE_DESCRIPTIONS.DATABASE_URL_POSTGRESQL)
  .regex(POSTGRES_URL_PATTERN, {
    error: DATABASE_MESSAGES.DATABASE_URL_POSTGRESQL_FORMAT,
  });

export const databaseUrlPostgresqlSchema = schema;
export const DATABASE_URL_POSTGRESQL = databaseUrlPostgresqlSchema;
