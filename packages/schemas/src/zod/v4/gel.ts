import { z } from "zod";
import {
  descriptions,
  messages,
  defaults,
  constraints,
  patterns,
} from "../../shared/gel";

export const gelDsn = () =>
  z.string().describe(descriptions.gelDsn).regex(patterns.gelDsn, {
    message: messages.gelDsnFormat,
  });

export const gelInstance = () =>
  z.string().describe(descriptions.gelInstance).regex(patterns.gelInstance, {
    message: messages.gelInstanceFormat,
  });

export const gelSecretKey = () =>
  z
    .string()
    .describe(descriptions.gelSecretKey)
    .min(1, { message: messages.gelSecretKeyRequired });

export const gelHost = () =>
  z
    .string()
    .describe(descriptions.gelHost)
    .min(1, { message: messages.gelHostRequired })
    .default("localhost");

export const gelPort = () =>
  z.coerce
    .number()
    .describe(descriptions.gelPort)
    .int({ message: messages.gelPortInt })
    .min(constraints.gelPortMin, { message: messages.gelPortMin })
    .max(constraints.gelPortMax, { message: messages.gelPortMax })
    .default(defaults.gelPort);

export const gelUser = () =>
  z
    .string()
    .describe(descriptions.gelUser)
    .min(1, { message: messages.gelUserRequired })
    .default(defaults.gelUser);

export const gelPassword = () =>
  z
    .string()
    .describe(descriptions.gelPassword)
    .min(1, { message: messages.gelPasswordRequired });

export const gelBranch = () =>
  z
    .string()
    .describe(descriptions.gelBranch)
    .regex(patterns.gelBranch, {
      message: messages.gelBranchFormat,
    })
    .default(defaults.gelBranch);

export const gelTlsCaFile = () =>
  z
    .string()
    .describe(descriptions.gelTlsCaFile)
    .min(1, { message: messages.gelTlsCaFileFormat })
    .optional();

export const gelClientTlsSecurity = () =>
  z
    .enum(["strict", "no_host_verification", "insecure"])
    .describe(descriptions.gelClientTlsSecurity)
    .default(defaults.gelClientTlsSecurity);

export const gelCredentialsFile = () =>
  z
    .string()
    .describe(descriptions.gelCredentialsFile)
    .min(1, { message: messages.gelCredentialsFileFormat })
    .optional();

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
