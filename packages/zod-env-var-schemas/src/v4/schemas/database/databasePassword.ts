import { z } from "zod";
import { DATABASE_DESCRIPTIONS, DATABASE_MESSAGES } from "../../../shared/database";

const schema = z
  .string()
  .describe(DATABASE_DESCRIPTIONS.DATABASE_PASSWORD)
  .min(1, { error: DATABASE_MESSAGES.DATABASE_PASSWORD_REQUIRED });

export const databasePasswordSchema = schema;
export const DATABASE_PASSWORD = databasePasswordSchema;
