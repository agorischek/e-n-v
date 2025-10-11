import { z } from "zod";
import {
  DATABASE_DESCRIPTIONS,
  DATABASE_LIMITS,
  DATABASE_MESSAGES,
} from "../../../shared/database";

const schema = z
  .number()
  .describe(DATABASE_DESCRIPTIONS.DATABASE_PORT)
  .int({ error: DATABASE_MESSAGES.DATABASE_PORT_INT })
  .min(DATABASE_LIMITS.DATABASE_PORT_MIN, { error: DATABASE_MESSAGES.DATABASE_PORT_MIN })
  .max(DATABASE_LIMITS.DATABASE_PORT_MAX, { error: DATABASE_MESSAGES.DATABASE_PORT_MAX });

export const databasePortSchema = schema;
export const DATABASE_PORT = databasePortSchema;
