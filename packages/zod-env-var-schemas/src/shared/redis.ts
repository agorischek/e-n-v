export const descriptions = {
  url: "Redis connection string (redis:// or rediss://)",
  host: "Redis server host name or IP address",
  port: "Redis server port number",
  username: "Redis username for ACL authentication",
  password: "Redis password or access token",
  db: "Redis logical database index (0-15)",
  tls: "Enable TLS for connections to Redis",
  tlsCaCertPath: "Path to CA certificate file for Redis TLS validation",
} as const;

export const messages = {
  urlFormat: "Redis URL must start with redis:// or rediss://",
  hostRequired: "Redis host is required",
  hostFormat: "Redis host may contain letters, numbers, dots, and hyphens",
  portInteger: "Redis port must be an integer",
  portMin: "Redis port must be at least 1",
  portMax: "Redis port must be 65535 or less",
  dbInteger: "Redis database index must be an integer",
  dbRange: "Redis database index must be between 0 and 15",
  usernameRequired: "Redis username cannot be empty",
  passwordRequired: "Redis password cannot be empty",
  tlsCaCertPathRequired: "Redis TLS CA certificate path cannot be empty",
} as const;

export const defaults = {
  port: 6379,
  db: 0,
  tls: false,
} as const;

export const constraints = {
  portMin: 1,
  portMax: 65535,
  dbMin: 0,
  dbMax: 15,
} as const;

export const patterns = {
  url: /^rediss?:\/\/(?:[^:@/\s]+(?::[^@/\s]*)?@)?[^:/\s]+(?::\d+)?(?:\/\d+)?(?:\?.*)?$/,
  host: /^[a-zA-Z0-9.-]+$/,
} as const;
