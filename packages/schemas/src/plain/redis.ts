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
  constraints,
  defaults,
  descriptions,
  traits,
  patterns,
} from "../shared/redis";

export const redisUrl = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.url,
    process: string(
      pattern(patterns.url, traits.urlFormat)
    ),
    ...input,
  });

export const redisHost = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.host,
    process: string(
      minLength(1, traits.hostRequired),
      pattern(patterns.host, traits.hostFormat)
    ),
    required: false,
    ...input,
  });

export const redisPort = (input: Partial<NumberEnvVarSchemaInput> = {}) =>
  new NumberEnvVarSchema({
    description: descriptions.port,
    default: defaults.port,
    process: number(
      integer(traits.portInteger),
      between(constraints.portMin, constraints.portMax)
    ),
    ...input,
  });

export const redisPassword = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.password,
    process: string(
      minLength(1, traits.passwordRequired)
    ),
    secret: true,
    required: false,
    ...input,
  });

export const redisUsername = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.username,
    process: string(
      minLength(1, traits.usernameRequired)
    ),
    required: false,
    ...input,
  });

export const redisDb = (input: Partial<NumberEnvVarSchemaInput> = {}) =>
  new NumberEnvVarSchema({
    description: descriptions.db,
    default: defaults.db,
    process: number(
      integer(traits.dbInteger),
      between(constraints.dbMin, constraints.dbMax)
    ),
    ...input,
  });

export const redisTls = (input: Partial<BooleanEnvVarSchemaInput> = {}) =>
  new BooleanEnvVarSchema({
    description: descriptions.tls,
    default: defaults.tls,
    ...input,
  });

export const redisTlsCaCertPath = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.tlsCaCertPath,
    process: string(
      minLength(1, traits.tlsCaCertPathRequired)
    ),
    required: false,
    ...input,
  });

export const REDIS_URL = redisUrl();
export const REDIS_HOST = redisHost();
export const REDIS_PORT = redisPort();
export const REDIS_PASSWORD = redisPassword();
export const REDIS_USERNAME = redisUsername();
export const REDIS_DB = redisDb();
export const REDIS_TLS = redisTls();
export const REDIS_TLS_CA_CERT_PATH = redisTlsCaCertPath();

