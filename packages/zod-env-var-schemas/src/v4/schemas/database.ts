import { z } from "zod";
import { descriptions, messages, defaults, constraints } from "../../shared/database";
import {
  POSTGRES_URL_PATTERN,
  MYSQL_URL_PATTERN,
  MONGODB_URL_PATTERN,
  SQLSERVER_URL_PREFIX_PATTERN,
  REDIS_URL_PATTERN,
  GENERIC_DATABASE_URL_PATTERN,
} from "../../shared/patterns";

// Database URLs for specific database types
export const databaseUrlPostgresql = () =>
  z
    .string()
    .describe(descriptions.databaseUrlPostgresql)
    .regex(POSTGRES_URL_PATTERN, {
      message: messages.databaseUrlPostgresqlFormat,
    });

export const databaseUrlMysql = () =>
  z
    .string()
    .describe(descriptions.databaseUrlMysql)
    .regex(MYSQL_URL_PATTERN, {
      message: messages.databaseUrlMysqlFormat,
    });

export const databaseUrlMongodb = () =>
  z
    .string()
    .describe(descriptions.databaseUrlMongodb)
    .regex(MONGODB_URL_PATTERN, {
      message: messages.databaseUrlMongodbFormat,
    });

export const databaseUrlSqlserver = () =>
  z
    .string()
    .describe(descriptions.databaseUrlSqlserver)
    .regex(SQLSERVER_URL_PREFIX_PATTERN, {
      message: messages.databaseUrlSqlserverFormat,
    });

// Generic database URL
export const databaseUrl = () =>
  z
    .string()
    .describe(descriptions.databaseUrl)
    .regex(GENERIC_DATABASE_URL_PATTERN, {
      message: messages.genericDatabaseUrlFormat,
    });

// Redis URL
export const redisUrl = () =>
  z
    .string()
    .describe(descriptions.redisUrl)
    .regex(REDIS_URL_PATTERN, {
      message: messages.redisUrlFormat,
    });

// Database connection details
export const databaseHost = () =>
  z
    .string()
    .describe(descriptions.databaseHost)
    .min(1, { message: messages.databaseHostRequired });

export const databasePort = () =>
  z
    .number()
    .describe(descriptions.databasePort)
    .int({ message: messages.databasePortInt })
    .min(constraints.databasePortMin, { message: messages.databasePortMin })
    .max(constraints.databasePortMax, { message: messages.databasePortMax });

export const databaseName = () =>
  z
    .string()
    .describe(descriptions.databaseName)
    .min(1, { message: messages.databaseNameRequired });

export const databaseUsername = () =>
  z
    .string()
    .describe(descriptions.databaseUsername)
    .min(1, { message: messages.databaseUsernameRequired });

export const databasePassword = () =>
  z
    .string()
    .describe(descriptions.databasePassword)
    .min(1, { message: messages.databasePasswordRequired });

export const databaseSchema = () =>
  z
    .string()
    .describe(descriptions.databaseSchema)
    .optional();

export const databasePoolSize = () =>
  z
    .number()
    .describe(descriptions.databasePoolSize)
    .int({ message: messages.databasePoolSizeInt })
    .min(constraints.databasePoolSizeMin, { message: messages.databasePoolSizeMin })
    .max(constraints.databasePoolSizeMax, { message: messages.databasePoolSizeMax })
    .default(defaults.databasePoolSize);

export const databaseTimeout = () =>
  z
    .number()
    .describe(descriptions.databaseTimeout)
    .int({ message: messages.databaseTimeoutInt })
    .min(constraints.databaseTimeoutMin, { message: messages.databaseTimeoutMin })
    .max(constraints.databaseTimeoutMax, { message: messages.databaseTimeoutMax })
    .default(defaults.databaseTimeout);

export const databaseSsl = () =>
  z
    .boolean()
    .describe(descriptions.databaseSsl)
    .default(defaults.databaseSsl);

// Constant exports
export const DATABASE_URL_POSTGRESQL = databaseUrlPostgresql();
export const DATABASE_URL_MYSQL = databaseUrlMysql();
export const DATABASE_URL_MONGODB = databaseUrlMongodb();
export const DATABASE_URL_SQLSERVER = databaseUrlSqlserver();
export const DATABASE_URL = databaseUrl();
export const REDIS_URL = redisUrl();
export const DATABASE_HOST = databaseHost();
export const DATABASE_PORT = databasePort();
export const DATABASE_NAME = databaseName();
export const DATABASE_USERNAME = databaseUsername();
export const DATABASE_PASSWORD = databasePassword();
export const DATABASE_SCHEMA = databaseSchema();
export const DATABASE_POOL_SIZE = databasePoolSize();
export const DATABASE_TIMEOUT = databaseTimeout();
export const DATABASE_SSL = databaseSsl();