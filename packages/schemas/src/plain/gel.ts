import {
  StringEnvVarSchema,
  NumberEnvVarSchema,
  EnumEnvVarSchema,
  type StringEnvVarSchemaInput,
  type NumberEnvVarSchemaInput,
  type EnumEnvVarSchemaInput,
} from "@e-n-v/core";
import { createZodProcessor } from "../helpers/createZodProcesor";
import { z } from "zod";
import {
  descriptions,
  messages,
  defaults,
  constraints,
  patterns,
} from "../shared/gel";

export const gelDsn = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.gelDsn,
    process: createZodProcessor(
      z.string().regex(patterns.gelDsn, {
        message: messages.gelDsnFormat,
      }),
    ),
    secret: true,
    ...input,
  });

export const gelInstance = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.gelInstance,
    process: createZodProcessor(
      z.string().regex(patterns.gelInstance, {
        message: messages.gelInstanceFormat,
      }),
    ),
    ...input,
  });

export const gelSecretKey = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.gelSecretKey,
    process: createZodProcessor(
      z.string().min(1, { message: messages.gelSecretKeyRequired }),
    ),
    secret: true,
    ...input,
  });

export const gelHost = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.gelHost,
    process: createZodProcessor(
      z.string().min(1, { message: messages.gelHostRequired }),
    ),
    default: "localhost",
    ...input,
  });

export const gelPort = (input: Partial<NumberEnvVarSchemaInput> = {}) =>
  new NumberEnvVarSchema({
    description: descriptions.gelPort,
    default: defaults.gelPort,
    process: createZodProcessor(
      z.coerce
        .number()
        .int({ message: messages.gelPortInt })
        .min(constraints.gelPortMin, { message: messages.gelPortMin })
        .max(constraints.gelPortMax, {
          message: messages.gelPortMax,
        }),
    ),
    ...input,
  });

export const gelUser = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.gelUser,
    process: createZodProcessor(
      z.string().min(1, { message: messages.gelUserRequired }),
    ),
    default: defaults.gelUser,
    ...input,
  });

export const gelPassword = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.gelPassword,
    process: createZodProcessor(
      z.string().min(1, { message: messages.gelPasswordRequired }),
    ),
    secret: true,
    ...input,
  });

export const gelBranch = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.gelBranch,
    process: createZodProcessor(
      z.string().regex(patterns.gelBranch, {
        message: messages.gelBranchFormat,
      }),
    ),
    default: defaults.gelBranch,
    ...input,
  });

export const gelTlsCaFile = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.gelTlsCaFile,
    process: createZodProcessor(
      z.string().min(1, { message: messages.gelTlsCaFileFormat }),
    ),
    required: false,
    ...input,
  });

export const gelClientTlsSecurity = (
  input: Partial<EnumEnvVarSchemaInput<"strict" | "no_host_verification" | "insecure">> = {},
) =>
  new EnumEnvVarSchema({
    description: descriptions.gelClientTlsSecurity,
    values: ["strict", "no_host_verification", "insecure"],
    default: defaults.gelClientTlsSecurity,
    process: createZodProcessor(
      z.enum(["strict", "no_host_verification", "insecure"]),
    ),
    ...input,
  });

export const gelCredentialsFile = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.gelCredentialsFile,
    process: createZodProcessor(
      z.string().min(1, { message: messages.gelCredentialsFileFormat }),
    ),
    required: false,
    ...input,
  });

export const GEL_DSN = gelDsn();
export const GEL_INSTANCE = gelInstance();
export const GEL_SECRET_KEY = gelSecretKey();
export const GEL_HOST = gelHost();
export const GEL_PORT = gelPort();
export const GEL_USER = gelUser();
export const GEL_PASSWORD = gelPassword();
export const GEL_BRANCH = gelBranch();
export const GEL_TLS_CA_FILE = gelTlsCaFile();
export const GEL_CLIENT_TLS_SECURITY = gelClientTlsSecurity();
export const GEL_CREDENTIALS_FILE = gelCredentialsFile();

