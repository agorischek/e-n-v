import { z } from "zod";
import { DATABASE_DESCRIPTIONS, DATABASE_MESSAGES } from "../../../shared/database";

const schema = z
  .string()
  .describe(DATABASE_DESCRIPTIONS.DATABASE_HOST)
  .min(1, { error: DATABASE_MESSAGES.DATABASE_HOST_REQUIRED });

export const databaseHostSchema = schema;
export const DATABASE_HOST = databaseHostSchema;
