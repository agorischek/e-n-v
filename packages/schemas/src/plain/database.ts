import {
  StringEnvVarSchema,
  NumberEnvVarSchema,
  BooleanEnvVarSchema,
  type StringEnvVarSchemaInput,
  type NumberEnvVarSchemaInput,
  type BooleanEnvVarSchemaInput,
} from "@e-n-v/core";
import {
  string,
  number,
  pattern,
  minLength,
  integer,
  between,
} from "@e-n-v/core";
import {
  traits,
  constraints,
  defaults,
  descriptions,
  patterns,
} from "../shared/database";

export const databaseUrl = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.databaseUrl,
    process: string(
      pattern(patterns.genericDatabaseUrl, traits.genericDatabaseUrlFormat),
    ),
    secret: true,
    ...input,
  });

export const databaseHost = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.databaseHost,
    process: string(minLength(1, traits.databaseHostRequired)),
    ...input,
  });

export const databasePort = (input: Partial<NumberEnvVarSchemaInput> = {}) =>
  new NumberEnvVarSchema({
    description: descriptions.databasePort,
    process: number(
      integer(traits.databasePortInt),
      between(constraints.databasePortMin, constraints.databasePortMax),
    ),
    ...input,
  });

export const databaseName = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.databaseName,
    process: string(minLength(1, traits.databaseNameRequired)),
    ...input,
  });

export const databaseUsername = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.databaseUsername,
    process: string(minLength(1, traits.databaseUsernameRequired)),
    ...input,
  });

export const databasePassword = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.databasePassword,
    process: string(minLength(1, traits.databasePasswordRequired)),
    secret: true,
    ...input,
  });

export const databaseSchema = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.databaseSchema,
    process: string(),
    required: false,
    ...input,
  });

export const databasePoolSize = (
  input: Partial<NumberEnvVarSchemaInput> = {},
) =>
  new NumberEnvVarSchema({
    description: descriptions.databasePoolSize,
    default: defaults.databasePoolSize,
    process: number(
      integer(traits.databasePoolSizeInt),
      between(constraints.databasePoolSizeMin, constraints.databasePoolSizeMax),
    ),
    ...input,
  });

export const databaseTimeout = (input: Partial<NumberEnvVarSchemaInput> = {}) =>
  new NumberEnvVarSchema({
    description: descriptions.databaseTimeout,
    default: defaults.databaseTimeout,
    process: number(
      integer(traits.databaseTimeoutInt),
      between(constraints.databaseTimeoutMin, constraints.databaseTimeoutMax),
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
