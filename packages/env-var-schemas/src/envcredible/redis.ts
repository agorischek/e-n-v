import { StringEnvVarSchema, NumberEnvVarSchema, BooleanEnvVarSchema, type StringEnvVarSchemaInput, type NumberEnvVarSchemaInput, type BooleanEnvVarSchemaInput } from "../../../envcredible-core/src";
import { createZodProcessor } from "../helpers/zodHelpers";
import { z } from "zod";
import {
  constraints,
  defaults,
  descriptions,
  messages,
  patterns,
} from "../shared/redis";

export const redisUrl = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.url,
    process: createZodProcessor(
      z.string()
        .regex(patterns.url, { message: messages.urlFormat }),
    ),
    ...input,
  });

export const redisHost = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.host,
    process: createZodProcessor(
      z.string()
        .min(1, { message: messages.hostRequired })
        .regex(patterns.host, { message: messages.hostFormat }),
    ),
    required: false,
    ...input,
  });

export const redisPort = (input: Partial<NumberEnvVarSchemaInput> = {}) =>
  new NumberEnvVarSchema({
    description: descriptions.port,
    default: defaults.port,
    process: createZodProcessor(
      z.coerce.number()
        .int({ message: messages.portInteger })
        .min(constraints.portMin, { message: messages.portMin })
        .max(constraints.portMax, { message: messages.portMax }),
    ),
    ...input,
  });

export const redisPassword = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.password,
    process: createZodProcessor(
      z.string().min(1, { message: messages.passwordRequired }),
    ),
    secret: true,
    required: false,
    ...input,
  });

export const redisUsername = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.username,
    process: createZodProcessor(
      z.string().min(1, { message: messages.usernameRequired }),
    ),
    required: false,
    ...input,
  });

export const redisDb = (input: Partial<NumberEnvVarSchemaInput> = {}) =>
  new NumberEnvVarSchema({
    description: descriptions.db,
    default: defaults.db,
    process: createZodProcessor(
      z.coerce.number()
        .int({ message: messages.dbInteger })
        .min(constraints.dbMin, { message: messages.dbRange })
        .max(constraints.dbMax, { message: messages.dbRange }),
    ),
    ...input,
  });

export const redisTls = (input: Partial<BooleanEnvVarSchemaInput> = {}) =>
  new BooleanEnvVarSchema({
    description: descriptions.tls,
    default: defaults.tls,
    ...input,
  });

export const redisTlsCaCertPath = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.tlsCaCertPath,
    process: createZodProcessor(
      z.string().min(1, { message: messages.tlsCaCertPathRequired }),
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

export const redis = {
  REDIS_URL,
  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASSWORD,
  REDIS_USERNAME,
  REDIS_DB,
  REDIS_TLS,
  REDIS_TLS_CA_CERT_PATH,
} as const;