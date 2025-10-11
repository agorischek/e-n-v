import { z } from "zod";
import {
  DATABASE_NAME_PATTERN,
  DATABASE_SCHEMA_PATTERN,
  GENERIC_DATABASE_URL_PATTERN,
  MONGODB_URL_PATTERN,
  MYSQL_URL_PATTERN,
  POSTGRES_URL_PATTERN,
  REDIS_URL_PATTERN,
  SQLSERVER_DATABASE_PATTERN,
  SQLSERVER_INITIAL_CATALOG_PATTERN,
  SQLSERVER_SERVER_PATTERN,
  SQLSERVER_URL_PREFIX_PATTERN,
} from "../../shared/patterns";
import {
  DATABASE_DEFAULTS,
  DATABASE_DESCRIPTIONS,
  DATABASE_LIMITS,
  DATABASE_MESSAGES,
} from "../../shared/database";

/**
 * PostgreSQL database connection string
 * Format: postgresql://[user[:password]@][netloc][:port][/dbname][?param1=value1&...]
 */
export const DATABASE_URL_POSTGRESQL = z
  .string()
  .describe(DATABASE_DESCRIPTIONS.DATABASE_URL_POSTGRESQL)
  .regex(POSTGRES_URL_PATTERN, {
    error: DATABASE_MESSAGES.DATABASE_URL_POSTGRESQL_FORMAT,
  });

/**
 * MySQL database connection string
 * Format: mysql://[user[:password]@][netloc][:port][/dbname][?param1=value1&...]
 */
export const DATABASE_URL_MYSQL = z
  .string()
  .describe(DATABASE_DESCRIPTIONS.DATABASE_URL_MYSQL)
  .regex(MYSQL_URL_PATTERN, {
    error: DATABASE_MESSAGES.DATABASE_URL_MYSQL_FORMAT,
  });

/**
 * MongoDB connection string
 * Format: mongodb://[username:password@]host1[:port1][,...hostN[:portN]][/[defaultauthdb][?options]]
 * or mongodb+srv://[username:password@]host[/[defaultauthdb][?options]]
 */
export const DATABASE_URL_MONGODB = z
  .string()
  .describe(DATABASE_DESCRIPTIONS.DATABASE_URL_MONGODB)
  .regex(MONGODB_URL_PATTERN, {
    error: DATABASE_MESSAGES.DATABASE_URL_MONGODB_FORMAT,
  });

/**
 * Microsoft SQL Server connection string
 * Format: sqlserver://[user[:password]@]server[:port][/database][?param1=value1&...]
 * or Server=server;Database=database;User Id=user;Password=password;...
 */
export const DATABASE_URL_SQLSERVER = z
  .string()
  .describe(DATABASE_DESCRIPTIONS.DATABASE_URL_SQLSERVER)
  .refine(
    (val) =>
      SQLSERVER_URL_PREFIX_PATTERN.test(val) ||
      (SQLSERVER_SERVER_PATTERN.test(val) &&
        (SQLSERVER_DATABASE_PATTERN.test(val) || SQLSERVER_INITIAL_CATALOG_PATTERN.test(val))),
    { error: DATABASE_MESSAGES.DATABASE_URL_SQLSERVER_FORMAT }
  );

/**
 * Redis connection string
 * Format: redis://[username:password@]host[:port][/database][?option=value&...]
 * or rediss:// for SSL connections
 */
export const REDIS_URL = z
  .string()
  .describe(DATABASE_DESCRIPTIONS.REDIS_URL)
  .regex(REDIS_URL_PATTERN, {
    error: DATABASE_MESSAGES.REDIS_URL_FORMAT,
  });

/**
 * Generic database URL that accepts common database schemes
 */
export const DATABASE_URL = z
  .string()
  .describe(DATABASE_DESCRIPTIONS.DATABASE_URL)
  .regex(GENERIC_DATABASE_URL_PATTERN, {
    error: DATABASE_MESSAGES.GENERIC_DATABASE_URL_FORMAT,
  });

/**
 * Database host for separate host/port configuration
 */
export const DATABASE_HOST = z
  .string()
  .describe(DATABASE_DESCRIPTIONS.DATABASE_HOST)
  .min(1, { error: DATABASE_MESSAGES.DATABASE_HOST_REQUIRED });

/**
 * Database port number
 */
export const DATABASE_PORT = z
  .number()
  .describe(DATABASE_DESCRIPTIONS.DATABASE_PORT)
  .int({ error: DATABASE_MESSAGES.DATABASE_PORT_INT })
  .min(DATABASE_LIMITS.DATABASE_PORT_MIN, { error: DATABASE_MESSAGES.DATABASE_PORT_MIN })
  .max(DATABASE_LIMITS.DATABASE_PORT_MAX, { error: DATABASE_MESSAGES.DATABASE_PORT_MAX });

/**
 * Database name
 */
export const DATABASE_NAME = z
  .string()
  .describe(DATABASE_DESCRIPTIONS.DATABASE_NAME)
  .min(1, { error: DATABASE_MESSAGES.DATABASE_NAME_REQUIRED })
  .regex(DATABASE_NAME_PATTERN, {
    error: DATABASE_MESSAGES.DATABASE_NAME_FORMAT,
  });

/**
 * Database username
 */
export const DATABASE_USERNAME = z
  .string()
  .describe(DATABASE_DESCRIPTIONS.DATABASE_USERNAME)
  .min(1, { error: DATABASE_MESSAGES.DATABASE_USERNAME_REQUIRED });

/**
 * Database password
 */
export const DATABASE_PASSWORD = z
  .string()
  .describe(DATABASE_DESCRIPTIONS.DATABASE_PASSWORD)
  .min(1, { error: DATABASE_MESSAGES.DATABASE_PASSWORD_REQUIRED });

/**
 * Database schema name (for databases that support schemas)
 */
export const DATABASE_SCHEMA = z
  .string()
  .describe(DATABASE_DESCRIPTIONS.DATABASE_SCHEMA)
  .regex(DATABASE_SCHEMA_PATTERN, {
    error: DATABASE_MESSAGES.DATABASE_SCHEMA_FORMAT,
  })
  .optional();

/**
 * Database connection pool size
 */
export const DATABASE_POOL_SIZE = z
  .number()
  .describe(DATABASE_DESCRIPTIONS.DATABASE_POOL_SIZE)
  .int({ error: DATABASE_MESSAGES.DATABASE_POOL_SIZE_INT })
  .min(DATABASE_LIMITS.DATABASE_POOL_SIZE_MIN, { error: DATABASE_MESSAGES.DATABASE_POOL_SIZE_MIN })
  .max(DATABASE_LIMITS.DATABASE_POOL_SIZE_MAX, { error: DATABASE_MESSAGES.DATABASE_POOL_SIZE_MAX })
  .default(DATABASE_DEFAULTS.DATABASE_POOL_SIZE);

/**
 * Database connection timeout in milliseconds
 */
export const DATABASE_TIMEOUT = z
  .number()
  .describe(DATABASE_DESCRIPTIONS.DATABASE_TIMEOUT)
  .int({ error: DATABASE_MESSAGES.DATABASE_TIMEOUT_INT })
  .min(DATABASE_LIMITS.DATABASE_TIMEOUT_MIN, { error: DATABASE_MESSAGES.DATABASE_TIMEOUT_MIN })
  .max(DATABASE_LIMITS.DATABASE_TIMEOUT_MAX, { error: DATABASE_MESSAGES.DATABASE_TIMEOUT_MAX })
  .default(DATABASE_DEFAULTS.DATABASE_TIMEOUT);

/**
 * Enable database SSL connection
 */
export const DATABASE_SSL = z
  .boolean()
  .describe(DATABASE_DESCRIPTIONS.DATABASE_SSL)
  .default(DATABASE_DEFAULTS.DATABASE_SSL);

/**
 * Pre-configured database schemas for common scenarios
 */
export const databaseSchemas = {
  DATABASE_URL,
  DATABASE_URL_POSTGRESQL,
  DATABASE_URL_MYSQL,
  DATABASE_URL_MONGODB,
  DATABASE_URL_SQLSERVER,
  REDIS_URL,
  DATABASE_HOST,
  DATABASE_PORT,
  DATABASE_NAME,
  DATABASE_USERNAME,
  DATABASE_PASSWORD,
  DATABASE_SCHEMA,
  DATABASE_POOL_SIZE,
  DATABASE_TIMEOUT,
  DATABASE_SSL,
} as const;
