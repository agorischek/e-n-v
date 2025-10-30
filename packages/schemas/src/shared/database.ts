export const descriptions = {
  databaseUrl: "Database connection string",
  databaseUrlPostgresql: "PostgreSQL database connection string",
  databaseUrlMysql: "MySQL database connection string",
  databaseUrlMongodb: "MongoDB connection string",
  databaseUrlSqlserver: "Microsoft SQL Server connection string",
  redisUrl: "Redis connection string",
  databaseHost: "Database host address",
  databasePort: "Database port number",
  databaseName: "Database name",
  databaseUsername: "Database username",
  databasePassword: "Database password",
  databaseSchema: "Database schema name",
  databasePoolSize: "Database connection pool size",
  databaseTimeout: "Database connection timeout (milliseconds)",
  databaseSsl: "Enable SSL connection to database",
} as const;

export const traits = {
  databaseUrlPostgresqlFormat:
    "a valid PostgreSQL connection string (postgresql://...)",
  databaseUrlMysqlFormat:
    "a valid MySQL connection string (mysql://...)",
  databaseUrlMongodbFormat:
    "a valid MongoDB connection string (mongodb:// or mongodb+srv://...)",
  databaseUrlSqlserverFormat:
    "a valid SQL Server connection string (sqlserver://... or Server=...;Database=...;...)",
  redisUrlFormat:
    "a valid Redis connection string (redis:// or rediss://...)",
  genericDatabaseUrlFormat:
    "a valid database connection string with supported protocol",
  databaseHostRequired: "database host is required",
  databasePortInt: "an integer",
  databasePortMin: "greater than 0",
  databasePortMax: "less than 65536",
  databaseNameRequired: "database name is required",
  databaseNameFormat:
    "database name must contain only letters, numbers, underscores, and hyphens",
  databaseUsernameRequired: "database username is required",
  databasePasswordRequired: "database password is required",
  databaseSchemaFormat:
    "schema name must contain only letters, numbers, and underscores",
  databasePoolSizeInt: "an integer",
  databasePoolSizeMin: "at least 1",
  databasePoolSizeMax: "not exceed 100",
  databaseTimeoutInt: "an integer",
  databaseTimeoutMin: "at least 1 second",
  databaseTimeoutMax: "not exceed 5 minutes",
} as const;

export const defaults = {
  databasePoolSize: 10,
  databaseTimeout: 30000,
  databaseSsl: true,
} as const;

export const constraints = {
  databasePortMin: 1,
  databasePortMax: 65535,
  databasePoolSizeMin: 1,
  databasePoolSizeMax: 100,
  databaseTimeoutMin: 1000,
  databaseTimeoutMax: 300000,
} as const;

export const patterns = {
  postgresUrl:
    /^postgresql:\/\/(?:[^:@/]+(?::[^@/]*)?@)?[^:/]+(?::\d+)?(?:\/[^?]*)?(?:\?.*)?$/,
  mysqlUrl:
    /^mysql:\/\/(?:[^:@/]+(?::[^@/]*)?@)?[^:/]+(?::\d+)?(?:\/[^?]*)?(?:\?.*)?$/,
  mongodbUrl:
    /^mongodb(?:\+srv)?:\/\/(?:[^:@/]+(?::[^@/]*)?@)?[^:/,]+(?::\d+)?(?:,[^:/,]+(?::\d+)?)*(?:\/[^?]*)?(?:\?.*)?$/,
  sqlserverUrlPrefix: /^sqlserver:\/\//,
  sqlserverServer: /Server=.+/,
  sqlserverDatabase: /Database=.+/,
  sqlserverInitialCatalog: /Initial Catalog=.+/,
  redisUrl:
    /^rediss?:\/\/(?:[^:@/]+(?::[^@/]*)?@)?[^:/]+(?::\d+)?(?:\/\d+)?(?:\?.*)?$/,
  genericDatabaseUrl:
    /^(postgresql|mysql|mongodb|mongodb\+srv|sqlserver|sqlite|oracle|redshift):\/\/.+/,
  databaseName: /^[a-zA-Z0-9_-]+$/,
  databaseSchema: /^[a-zA-Z0-9_]+$/,
} as const;
