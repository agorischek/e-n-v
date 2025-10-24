import {
  StringEnvVarSchema,
  NumberEnvVarSchema,
  BooleanEnvVarSchema,
  type StringEnvVarSchemaInput,
  type NumberEnvVarSchemaInput,
  type BooleanEnvVarSchemaInput,
} from "../../../envcredible-core/src";
import { createZodProcessor } from "../helpers/createZodProcesor";
import { z } from "zod";
import {
  descriptions,
  messages,
  defaults,
  constraints,
  patterns,
} from "../shared/database";

export const databaseUrl = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.databaseUrl,
    process: createZodProcessor(
      z.string().regex(patterns.genericDatabaseUrl, {
        message: messages.genericDatabaseUrlFormat,
      }),
    ),
    secret: true,
    ...input,
  });

export const databaseHost = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.databaseHost,
    process: createZodProcessor(
      z.string().min(1, { message: messages.databaseHostRequired }),
    ),
    ...input,
  });

export const databasePort = (input: Partial<NumberEnvVarSchemaInput> = {}) =>
  new NumberEnvVarSchema({
    description: descriptions.databasePort,
    process: createZodProcessor(
      z.coerce
        .number()
        .int({ message: messages.databasePortInt })
        .min(constraints.databasePortMin, { message: messages.databasePortMin })
        .max(constraints.databasePortMax, {
          message: messages.databasePortMax,
        }),
    ),
    ...input,
  });

export const databaseName = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.databaseName,
    process: createZodProcessor(
      z.string().min(1, { message: messages.databaseNameRequired }),
    ),
    ...input,
  });

export const databaseUsername = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.databaseUsername,
    process: createZodProcessor(
      z.string().min(1, { message: messages.databaseUsernameRequired }),
    ),
    ...input,
  });

export const databasePassword = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.databasePassword,
    process: createZodProcessor(
      z.string().min(1, { message: messages.databasePasswordRequired }),
    ),
    secret: true,
    ...input,
  });

export const databaseSchema = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.databaseSchema,
    process: createZodProcessor(z.string()),
    required: false,
    ...input,
  });

export const databasePoolSize = (
  input: Partial<NumberEnvVarSchemaInput> = {},
) =>
  new NumberEnvVarSchema({
    description: descriptions.databasePoolSize,
    default: defaults.databasePoolSize,
    process: createZodProcessor(
      z.coerce
        .number()
        .int({ message: messages.databasePoolSizeInt })
        .min(constraints.databasePoolSizeMin, {
          message: messages.databasePoolSizeMin,
        })
        .max(constraints.databasePoolSizeMax, {
          message: messages.databasePoolSizeMax,
        }),
    ),
    ...input,
  });

export const databaseTimeout = (input: Partial<NumberEnvVarSchemaInput> = {}) =>
  new NumberEnvVarSchema({
    description: descriptions.databaseTimeout,
    default: defaults.databaseTimeout,
    process: createZodProcessor(
      z.coerce
        .number()
        .int({ message: messages.databaseTimeoutInt })
        .min(constraints.databaseTimeoutMin, {
          message: messages.databaseTimeoutMin,
        })
        .max(constraints.databaseTimeoutMax, {
          message: messages.databaseTimeoutMax,
        }),
    ),
    ...input,
  });

export const databaseSsl = (input: Partial<BooleanEnvVarSchemaInput> = {}) =>
  new BooleanEnvVarSchema({
    description: descriptions.databaseSsl,
    default: defaults.databaseSsl,
    ...input,
  });

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
