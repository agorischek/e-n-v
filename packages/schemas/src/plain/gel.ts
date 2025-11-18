import {
  StringEnvVarSchema,
  NumberEnvVarSchema,
  EnumEnvVarSchema,
  type StringEnvVarSchemaInput,
  type NumberEnvVarSchemaInput,
  type EnumEnvVarSchemaInput,
} from "@e-n-v/core";
import {
  string,
  number,
  pattern,
  minLength,
  integer,
  between,
  oneOf,
} from "@e-n-v/core";
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
    process: string(pattern(patterns.gelDsn, messages.gelDsnFormat)),
    secret: true,
    ...input,
  });

export const gelInstance = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.gelInstance,
    process: string(pattern(patterns.gelInstance, messages.gelInstanceFormat)),
    ...input,
  });

export const gelSecretKey = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.gelSecretKey,
    process: string(minLength(1, messages.gelSecretKeyRequired)),
    secret: true,
    ...input,
  });

export const gelHost = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.gelHost,
    process: string(minLength(1, messages.gelHostRequired)),
    default: "localhost",
    ...input,
  });

export const gelPort = (input: Partial<NumberEnvVarSchemaInput> = {}) =>
  new NumberEnvVarSchema({
    description: descriptions.gelPort,
    default: defaults.gelPort,
    process: number(
      integer(messages.gelPortInt),
      between(constraints.gelPortMin, constraints.gelPortMax),
    ),
    ...input,
  });

export const gelUser = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.gelUser,
    process: string(minLength(1, messages.gelUserRequired)),
    default: defaults.gelUser,
    ...input,
  });

export const gelPassword = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.gelPassword,
    process: string(minLength(1, messages.gelPasswordRequired)),
    secret: true,
    ...input,
  });

export const gelBranch = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.gelBranch,
    process: string(pattern(patterns.gelBranch, messages.gelBranchFormat)),
    default: defaults.gelBranch,
    ...input,
  });

export const gelTlsCaFile = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.gelTlsCaFile,
    process: string(minLength(1, messages.gelTlsCaFileFormat)),
    required: false,
    ...input,
  });

export const gelClientTlsSecurity = (
  input: Partial<
    EnumEnvVarSchemaInput<"strict" | "no_host_verification" | "insecure">
  > = {},
) =>
  new EnumEnvVarSchema({
    description: descriptions.gelClientTlsSecurity,
    values: ["strict", "no_host_verification", "insecure"],
    default: defaults.gelClientTlsSecurity,
    process: string(oneOf(["strict", "no_host_verification", "insecure"])),
    ...input,
  });

export const gelCredentialsFile = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.gelCredentialsFile,
    process: string(minLength(1, messages.gelCredentialsFileFormat)),
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
