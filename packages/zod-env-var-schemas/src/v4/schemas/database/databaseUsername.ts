import { z } from "zod";
import { DATABASE_DESCRIPTIONS, DATABASE_MESSAGES } from "../../../shared/database";

const schema = z
  .string()
  .describe(DATABASE_DESCRIPTIONS.DATABASE_USERNAME)
  .min(1, { error: DATABASE_MESSAGES.DATABASE_USERNAME_REQUIRED });

export const databaseUsernameSchema = schema;
export const DATABASE_USERNAME = databaseUsernameSchema;
