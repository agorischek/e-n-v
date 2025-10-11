import { z } from "zod";
import {
  DATABASE_DEFAULTS,
  DATABASE_DESCRIPTIONS,
  DATABASE_LIMITS,
  DATABASE_MESSAGES,
} from "../../../shared/database";

const schema = z
  .number()
  .describe(DATABASE_DESCRIPTIONS.DATABASE_POOL_SIZE)
  .int({ error: DATABASE_MESSAGES.DATABASE_POOL_SIZE_INT })
  .min(DATABASE_LIMITS.DATABASE_POOL_SIZE_MIN, { error: DATABASE_MESSAGES.DATABASE_POOL_SIZE_MIN })
  .max(DATABASE_LIMITS.DATABASE_POOL_SIZE_MAX, { error: DATABASE_MESSAGES.DATABASE_POOL_SIZE_MAX })
  .default(DATABASE_DEFAULTS.DATABASE_POOL_SIZE);

export const databasePoolSizeSchema = schema;
export const DATABASE_POOL_SIZE = databasePoolSizeSchema;
