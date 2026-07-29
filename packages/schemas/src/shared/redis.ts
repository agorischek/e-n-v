import { toZodMessages } from "./zodMessages";

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

export const traits = {
  urlFormat: "start with redis:// or rediss://",
  hostRequired: "Redis host is required",
  hostFormat: "letters, numbers, dots, and hyphens",
  portInteger: "an integer",
  portMin: "at least 1",
  portMax: "65535 or less",
  dbInteger: "an integer",
  dbRange: "between 0 and 15",
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

export const messages = toZodMessages(traits);
