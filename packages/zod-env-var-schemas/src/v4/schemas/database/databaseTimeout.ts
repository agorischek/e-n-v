import { z } from "zod";
import {
  DATABASE_DEFAULTS,
  DATABASE_DESCRIPTIONS,
  DATABASE_LIMITS,
  DATABASE_MESSAGES,
} from "../../../shared/database";

const schema = z
  .number()
  .describe(DATABASE_DESCRIPTIONS.DATABASE_TIMEOUT)
  .int({ error: DATABASE_MESSAGES.DATABASE_TIMEOUT_INT })
  .min(DATABASE_LIMITS.DATABASE_TIMEOUT_MIN, { error: DATABASE_MESSAGES.DATABASE_TIMEOUT_MIN })
  .max(DATABASE_LIMITS.DATABASE_TIMEOUT_MAX, { error: DATABASE_MESSAGES.DATABASE_TIMEOUT_MAX })
  .default(DATABASE_DEFAULTS.DATABASE_TIMEOUT);

export const databaseTimeoutSchema = schema;
export const DATABASE_TIMEOUT = databaseTimeoutSchema;
