import { z } from "zod";
import {
  constraints,
  defaults,
  descriptions,
  messages,
  patterns,
} from "../shared/redis";

export const redisUrl = () =>
  z
    .string()
    .describe(descriptions.url)
    .regex(patterns.url, { message: messages.urlFormat });

export const redisHost = () =>
  z
    .string()
    .describe(descriptions.host)
    .min(1, { message: messages.hostRequired })
    .regex(patterns.host, { message: messages.hostFormat });

export const redisPort = () =>
  z
    .number()
    .describe(descriptions.port)
    .int({ message: messages.portInteger })
    .min(constraints.portMin, { message: messages.portMin })
    .max(constraints.portMax, { message: messages.portMax })
    .default(defaults.port);

export const redisUsername = () =>
  z
    .string()
    .describe(descriptions.username)
    .min(1, { message: messages.usernameRequired });

export const redisPassword = () =>
  z
    .string()
    .describe(descriptions.password)
    .min(1, { message: messages.passwordRequired });

export const redisDb = () =>
  z
    .number()
    .describe(descriptions.db)
    .int({ message: messages.dbInteger })
    .min(constraints.dbMin, { message: messages.dbRange })
    .max(constraints.dbMax, { message: messages.dbRange })
    .default(defaults.db);

export const redisTls = () =>
  z.boolean().describe(descriptions.tls).default(defaults.tls);

export const redisTlsCaCertPath = () =>
  z
    .string()
    .describe(descriptions.tlsCaCertPath)
    .min(1, { message: messages.tlsCaCertPathRequired });

export const REDIS_URL = redisUrl();
export const REDIS_HOST = redisHost();
export const REDIS_PORT = redisPort();
export const REDIS_USERNAME = redisUsername();
export const REDIS_PASSWORD = redisPassword();
export const REDIS_DB = redisDb();
export const REDIS_TLS = redisTls();
export const REDIS_TLS_CA_CERT_PATH = redisTlsCaCertPath();

export const redis = {
  REDIS_URL,
  REDIS_HOST,
  REDIS_PORT,
  REDIS_USERNAME,
  REDIS_PASSWORD,
  REDIS_DB,
  REDIS_TLS,
  REDIS_TLS_CA_CERT_PATH,
} as const;
