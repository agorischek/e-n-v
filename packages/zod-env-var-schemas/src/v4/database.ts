import { z } from "zod";
import {
  descriptions,
  messages,
  defaults,
  constraints,
} from "../shared/database";
import { GENERIC_DATABASE_URL_PATTERN } from "../shared/patterns";

export const databaseUrl = () =>
  z
    .string()
    .describe(descriptions.databaseUrl)
    .regex(GENERIC_DATABASE_URL_PATTERN, {
      message: messages.genericDatabaseUrlFormat,
    });

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
  z.string().describe(descriptions.databaseSchema).optional();

export const databasePoolSize = () =>
  z
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

export const databaseTimeout = () =>
  z
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

export const databaseSsl = () =>
  z.boolean().describe(descriptions.databaseSsl).default(defaults.databaseSsl);

export const DATABASE_URL = databaseUrl();
export const DATABASE_HOST = databaseHost();
export const DATABASE_PORT = databasePort();
export const DATABASE_NAME = databaseName();
export const DATABASE_USERNAME = databaseUsername();
export const DATABASE_PASSWORD = databasePassword();
export const DATABASE_SCHEMA = databaseSchema();
export const DATABASE_POOL_SIZE = databasePoolSize();
export const DATABASE_TIMEOUT = databaseTimeout();
export const DATABASE_SSL = databaseSsl();
