import { z } from "zod";
import {
  SQLSERVER_DATABASE_PATTERN,
  SQLSERVER_INITIAL_CATALOG_PATTERN,
  SQLSERVER_SERVER_PATTERN,
  SQLSERVER_URL_PREFIX_PATTERN,
} from "../../../shared/patterns";
import { DATABASE_DESCRIPTIONS, DATABASE_MESSAGES } from "../../../shared/database";

const schema = z
  .string()
  .describe(DATABASE_DESCRIPTIONS.DATABASE_URL_SQLSERVER)
  .refine(
    (val) =>
      SQLSERVER_URL_PREFIX_PATTERN.test(val) ||
      (SQLSERVER_SERVER_PATTERN.test(val) &&
        (SQLSERVER_DATABASE_PATTERN.test(val) || SQLSERVER_INITIAL_CATALOG_PATTERN.test(val))),
    { error: DATABASE_MESSAGES.DATABASE_URL_SQLSERVER_FORMAT }
  );

export const databaseUrlSqlserverSchema = schema;
export const DATABASE_URL_SQLSERVER = databaseUrlSqlserverSchema;
