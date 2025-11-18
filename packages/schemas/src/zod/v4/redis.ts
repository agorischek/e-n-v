import {
  constraints,
  defaults,
  descriptions,
  messages,
  patterns,
} from "../../shared/redis";
import type { ZodSingleton } from "./types";

export const redisUrl = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.url)
    .regex(patterns.url, { message: messages.urlFormat });

export const redisHost = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.host)
    .min(1, { message: messages.hostRequired })
    .regex(patterns.host, { message: messages.hostFormat });

export const redisPort = (z: ZodSingleton) =>
  z
    .number()
    .describe(descriptions.port)
    .int({ message: messages.portInteger })
    .min(constraints.portMin, { message: messages.portMin })
    .max(constraints.portMax, { message: messages.portMax })
    .default(defaults.port);

export const redisUsername = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.username)
    .min(1, { message: messages.usernameRequired });

export const redisPassword = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.password)
    .min(1, { message: messages.passwordRequired });

export const redisDb = (z: ZodSingleton) =>
  z
    .number()
    .describe(descriptions.db)
    .int({ message: messages.dbInteger })
    .min(constraints.dbMin, { message: messages.dbRange })
    .max(constraints.dbMax, { message: messages.dbRange })
    .default(defaults.db);

export const redisTls = (z: ZodSingleton) =>
  z.boolean().describe(descriptions.tls).default(defaults.tls);

export const redisTlsCaCertPath = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.tlsCaCertPath)
    .min(1, { message: messages.tlsCaCertPathRequired });
