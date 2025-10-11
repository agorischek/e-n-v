import { z } from "zod";
import { DATABASE_SCHEMA_PATTERN } from "../../../shared/patterns";
import { DATABASE_DESCRIPTIONS, DATABASE_MESSAGES } from "../../../shared/database";

const schema = z
  .string()
  .describe(DATABASE_DESCRIPTIONS.DATABASE_SCHEMA)
  .regex(DATABASE_SCHEMA_PATTERN, {
    error: DATABASE_MESSAGES.DATABASE_SCHEMA_FORMAT,
  })
  .optional();

export const databaseSchemaSchema = schema;
export const DATABASE_SCHEMA = databaseSchemaSchema;
