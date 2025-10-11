export const DATABASE_DESCRIPTIONS = {
  DATABASE_URL: "Database connection string",
  DATABASE_URL_POSTGRESQL: "PostgreSQL database connection string",
  DATABASE_URL_MYSQL: "MySQL database connection string",
  DATABASE_URL_MONGODB: "MongoDB connection string",
  DATABASE_URL_SQLSERVER: "Microsoft SQL Server connection string",
  REDIS_URL: "Redis connection string",
  DATABASE_HOST: "Database host address",
  DATABASE_PORT: "Database port number",
  DATABASE_NAME: "Database name",
  DATABASE_USERNAME: "Database username",
  DATABASE_PASSWORD: "Database password",
  DATABASE_SCHEMA: "Database schema name",
  DATABASE_POOL_SIZE: "Database connection pool size",
  DATABASE_TIMEOUT: "Database connection timeout (milliseconds)",
  DATABASE_SSL: "Enable SSL connection to database",
} as const;

export const DATABASE_MESSAGES = {
  DATABASE_URL_POSTGRESQL_FORMAT:
    "Must be a valid PostgreSQL connection string (postgresql://...)",
  DATABASE_URL_MYSQL_FORMAT:
    "Must be a valid MySQL connection string (mysql://...)",
  DATABASE_URL_MONGODB_FORMAT:
    "Must be a valid MongoDB connection string (mongodb:// or mongodb+srv://...)",
  DATABASE_URL_SQLSERVER_FORMAT:
    "Must be a valid SQL Server connection string (sqlserver://... or Server=...;Database=...;...)",
  REDIS_URL_FORMAT:
    "Must be a valid Redis connection string (redis:// or rediss://...)",
  GENERIC_DATABASE_URL_FORMAT:
    "Must be a valid database connection string with supported protocol",
  DATABASE_HOST_REQUIRED: "Database host is required",
  DATABASE_PORT_INT: "Port must be an integer",
  DATABASE_PORT_MIN: "Port must be greater than 0",
  DATABASE_PORT_MAX: "Port must be less than 65536",
  DATABASE_NAME_REQUIRED: "Database name is required",
  DATABASE_NAME_FORMAT:
    "Database name must contain only letters, numbers, underscores, and hyphens",
  DATABASE_USERNAME_REQUIRED: "Database username is required",
  DATABASE_PASSWORD_REQUIRED: "Database password is required",
  DATABASE_SCHEMA_FORMAT:
    "Schema name must contain only letters, numbers, and underscores",
  DATABASE_POOL_SIZE_INT: "Pool size must be an integer",
  DATABASE_POOL_SIZE_MIN: "Pool size must be at least 1",
  DATABASE_POOL_SIZE_MAX: "Pool size should not exceed 100",
  DATABASE_TIMEOUT_INT: "Timeout must be an integer",
  DATABASE_TIMEOUT_MIN: "Timeout must be at least 1 second",
  DATABASE_TIMEOUT_MAX: "Timeout should not exceed 5 minutes",
} as const;

export const DATABASE_DEFAULTS = {
  DATABASE_POOL_SIZE: 10,
  DATABASE_TIMEOUT: 30000,
  DATABASE_SSL: true,
} as const;

export const DATABASE_LIMITS = {
  DATABASE_PORT_MIN: 1,
  DATABASE_PORT_MAX: 65535,
  DATABASE_POOL_SIZE_MIN: 1,
  DATABASE_POOL_SIZE_MAX: 100,
  DATABASE_TIMEOUT_MIN: 1000,
  DATABASE_TIMEOUT_MAX: 300000,
} as const;
