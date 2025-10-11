import { DATABASE_URL } from "./databaseUrl";
import { DATABASE_URL_POSTGRESQL } from "./databaseUrlPostgresql";
import { DATABASE_URL_MYSQL } from "./databaseUrlMysql";
import { DATABASE_URL_MONGODB } from "./databaseUrlMongodb";
import { DATABASE_URL_SQLSERVER } from "./databaseUrlSqlserver";
import { REDIS_URL } from "./redisUrl";
import { DATABASE_HOST } from "./databaseHost";
import { DATABASE_PORT } from "./databasePort";
import { DATABASE_NAME } from "./databaseName";
import { DATABASE_USERNAME } from "./databaseUsername";
import { DATABASE_PASSWORD } from "./databasePassword";
import { DATABASE_SCHEMA } from "./databaseSchema";
import { DATABASE_POOL_SIZE } from "./databasePoolSize";
import { DATABASE_TIMEOUT } from "./databaseTimeout";
import { DATABASE_SSL } from "./databaseSsl";

export { databaseUrlSchema, DATABASE_URL } from "./databaseUrl";
export { databaseUrlPostgresqlSchema, DATABASE_URL_POSTGRESQL } from "./databaseUrlPostgresql";
export { databaseUrlMysqlSchema, DATABASE_URL_MYSQL } from "./databaseUrlMysql";
export { databaseUrlMongodbSchema, DATABASE_URL_MONGODB } from "./databaseUrlMongodb";
export { databaseUrlSqlserverSchema, DATABASE_URL_SQLSERVER } from "./databaseUrlSqlserver";
export { redisUrlSchema, REDIS_URL } from "./redisUrl";
export { databaseHostSchema, DATABASE_HOST } from "./databaseHost";
export { databasePortSchema, DATABASE_PORT } from "./databasePort";
export { databaseNameSchema, DATABASE_NAME } from "./databaseName";
export { databaseUsernameSchema, DATABASE_USERNAME } from "./databaseUsername";
export { databasePasswordSchema, DATABASE_PASSWORD } from "./databasePassword";
export { databaseSchemaSchema, DATABASE_SCHEMA } from "./databaseSchema";
export { databasePoolSizeSchema, DATABASE_POOL_SIZE } from "./databasePoolSize";
export { databaseTimeoutSchema, DATABASE_TIMEOUT } from "./databaseTimeout";
export { databaseSslSchema, DATABASE_SSL } from "./databaseSsl";

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
