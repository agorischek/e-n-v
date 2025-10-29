import {
  descriptions,
  messages,
  defaults,
  constraints,
} from "../../shared/database";
import { patterns } from "../../shared/database";
import type { ZodSingleton } from "./types";

export const databaseUrl = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.databaseUrl)
    .regex(patterns.genericDatabaseUrl, {
      message: messages.genericDatabaseUrlFormat,
    });

export const databaseHost = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.databaseHost)
    .min(1, { message: messages.databaseHostRequired });

export const databasePort = (z: ZodSingleton) =>
  z.coerce
    .number()
    .describe(descriptions.databasePort)
    .int({ message: messages.databasePortInt })
    .min(constraints.databasePortMin, { message: messages.databasePortMin })
    .max(constraints.databasePortMax, { message: messages.databasePortMax });

export const databaseName = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.databaseName)
    .min(1, { message: messages.databaseNameRequired });

export const databaseUsername = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.databaseUsername)
    .min(1, { message: messages.databaseUsernameRequired });

export const databasePassword = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.databasePassword)
    .min(1, { message: messages.databasePasswordRequired });

export const databaseSchema = (z: ZodSingleton) =>
  z.string().describe(descriptions.databaseSchema).optional();

export const databasePoolSize = (z: ZodSingleton) =>
  z.coerce
    .number()
    .describe(descriptions.databasePoolSize)
    .int({ message: messages.databasePoolSizeInt })
    .min(constraints.databasePoolSizeMin, {
      message: messages.databasePoolSizeMin,
    })
    .max(constraints.databasePoolSizeMax, {
      message: messages.databasePoolSizeMax,
    })
    .default(defaults.databasePoolSize);

export const databaseTimeout = (z: ZodSingleton) =>
  z.coerce
    .number()
    .describe(descriptions.databaseTimeout)
    .int({ message: messages.databaseTimeoutInt })
    .min(constraints.databaseTimeoutMin, {
      message: messages.databaseTimeoutMin,
    })
    .max(constraints.databaseTimeoutMax, {
      message: messages.databaseTimeoutMax,
    })
    .default(defaults.databaseTimeout);

export const databaseSsl = (z: ZodSingleton) =>
  z.boolean().describe(descriptions.databaseSsl).default(defaults.databaseSsl);
