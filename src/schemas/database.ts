import { z } from "zod";

/**
 * PostgreSQL database connection string
 * Format: postgresql://[user[:password]@][netloc][:port][/dbname][?param1=value1&...]
 */
export const DATABASE_URL_POSTGRESQL = z
  .string()
  .describe("PostgreSQL database connection string")
  .regex(
    /^postgresql:\/\/(?:[^:@\/]+(?::[^@\/]*)?@)?[^:\/]+(?::\d+)?(?:\/[^?]*)?(?:\?.*)?$/,
    "Must be a valid PostgreSQL connection string (postgresql://...)"
  );

/**
 * MySQL database connection string
 * Format: mysql://[user[:password]@][netloc][:port][/dbname][?param1=value1&...]
 */
export const DATABASE_URL_MYSQL = z
  .string()
  .describe("MySQL database connection string")
  .regex(
    /^mysql:\/\/(?:[^:@\/]+(?::[^@\/]*)?@)?[^:\/]+(?::\d+)?(?:\/[^?]*)?(?:\?.*)?$/,
    "Must be a valid MySQL connection string (mysql://...)"
  );

/**
 * MongoDB connection string
 * Format: mongodb://[username:password@]host1[:port1][,...hostN[:portN]][/[defaultauthdb][?options]]
 * or mongodb+srv://[username:password@]host[/[defaultauthdb][?options]]
 */
export const DATABASE_URL_MONGODB = z
  .string()
  .describe("MongoDB connection string")
  .regex(
    /^mongodb(?:\+srv)?:\/\/(?:[^:@\/]+(?::[^@\/]*)?@)?[^:\/,]+(?::\d+)?(?:,[^:\/,]+(?::\d+)?)*(?:\/[^?]*)?(?:\?.*)?$/,
    "Must be a valid MongoDB connection string (mongodb:// or mongodb+srv://...)"
  );

/**
 * Microsoft SQL Server connection string
 * Format: sqlserver://[user[:password]@]server[:port][/database][?param1=value1&...]
 * or Server=server;Database=database;User Id=user;Password=password;...
 */
export const DATABASE_URL_SQLSERVER = z
  .string()
  .describe("Microsoft SQL Server connection string")
  .refine(
    (val) => 
      /^sqlserver:\/\//.test(val) || 
      (/Server=.+/.test(val) && (/Database=.+/.test(val) || /Initial Catalog=.+/.test(val))),
    "Must be a valid SQL Server connection string (sqlserver://... or Server=...;Database=...;...)"
  );

/**
 * Redis connection string
 * Format: redis://[username:password@]host[:port][/database][?option=value&...]
 * or rediss:// for SSL connections
 */
export const REDIS_URL = z
  .string()
  .describe("Redis connection string")
  .regex(
    /^rediss?:\/\/(?:[^:@\/]+(?::[^@\/]*)?@)?[^:\/]+(?::\d+)?(?:\/\d+)?(?:\?.*)?$/,
    "Must be a valid Redis connection string (redis:// or rediss://...)"
  );

/**
 * Generic database URL that accepts common database schemes
 */
export const DATABASE_URL = z
  .string()
  .describe("Database connection string")
  .regex(
    /^(postgresql|mysql|mongodb|mongodb\+srv|sqlserver|sqlite|oracle|redshift):\/\/.+/,
    "Must be a valid database connection string with supported protocol"
  );

/**
 * Database host for separate host/port configuration
 */
export const DATABASE_HOST = z
  .string()
  .describe("Database host address")
  .min(1, "Database host is required");

/**
 * Database port number
 */
export const DATABASE_PORT = z
  .number()
  .describe("Database port number")
  .int("Port must be an integer")
  .min(1, "Port must be greater than 0")
  .max(65535, "Port must be less than 65536");

/**
 * Database name
 */
export const DATABASE_NAME = z
  .string()
  .describe("Database name")
  .min(1, "Database name is required")
  .regex(/^[a-zA-Z0-9_-]+$/, "Database name must contain only letters, numbers, underscores, and hyphens");

/**
 * Database username
 */
export const DATABASE_USERNAME = z
  .string()
  .describe("Database username")
  .min(1, "Database username is required");

/**
 * Database password
 */
export const DATABASE_PASSWORD = z
  .string()
  .describe("Database password")
  .min(1, "Database password is required");

/**
 * Database schema name (for databases that support schemas)
 */
export const DATABASE_SCHEMA = z
  .string()
  .describe("Database schema name")
  .regex(/^[a-zA-Z0-9_]+$/, "Schema name must contain only letters, numbers, and underscores")
  .optional();

/**
 * Database connection pool size
 */
export const DATABASE_POOL_SIZE = z
  .number()
  .describe("Database connection pool size")
  .int("Pool size must be an integer")
  .min(1, "Pool size must be at least 1")
  .max(100, "Pool size should not exceed 100")
  .default(10);

/**
 * Database connection timeout in milliseconds
 */
export const DATABASE_TIMEOUT = z
  .number()
  .describe("Database connection timeout (milliseconds)")
  .int("Timeout must be an integer")
  .min(1000, "Timeout must be at least 1 second")
  .max(300000, "Timeout should not exceed 5 minutes")
  .default(30000);

/**
 * Enable database SSL connection
 */
export const DATABASE_SSL = z
  .boolean()
  .describe("Enable SSL connection to database")
  .default(true);

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
};