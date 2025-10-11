import { z } from "zod";
import { DATABASE_DEFAULTS, DATABASE_DESCRIPTIONS } from "../../../shared/database";

const schema = z
  .boolean()
  .describe(DATABASE_DESCRIPTIONS.DATABASE_SSL)
  .default(DATABASE_DEFAULTS.DATABASE_SSL);

export const databaseSslSchema = schema;
export const DATABASE_SSL = databaseSslSchema;
