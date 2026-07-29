import {
  descriptions,
  messages,
  defaults,
  constraints,
  patterns,
} from "../../shared/gel";
import type { ZodSingleton } from "./types";

export const gelDsn = (z: ZodSingleton) =>
  z.string().describe(descriptions.gelDsn).regex(patterns.gelDsn, {
    message: messages.gelDsnFormat,
  });

export const gelInstance = (z: ZodSingleton) =>
  z.string().describe(descriptions.gelInstance).regex(patterns.gelInstance, {
    message: messages.gelInstanceFormat,
  });

export const gelSecretKey = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.gelSecretKey)
    .min(1, { message: messages.gelSecretKeyRequired });

export const gelHost = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.gelHost)
    .min(1, { message: messages.gelHostRequired })
    .default("localhost");

export const gelPort = (z: ZodSingleton) =>
  z.coerce
    .number()
    .describe(descriptions.gelPort)
    .int({ message: messages.gelPortInt })
    .min(constraints.gelPortMin, { message: messages.gelPortMin })
    .max(constraints.gelPortMax, { message: messages.gelPortMax })
    .default(defaults.gelPort);

export const gelUser = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.gelUser)
    .min(1, { message: messages.gelUserRequired })
    .default(defaults.gelUser);

export const gelPassword = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.gelPassword)
    .min(1, { message: messages.gelPasswordRequired });

export const gelBranch = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.gelBranch)
    .regex(patterns.gelBranch, {
      message: messages.gelBranchFormat,
    })
    .default(defaults.gelBranch);

export const gelTlsCaFile = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.gelTlsCaFile)
    .min(1, { message: messages.gelTlsCaFileFormat })
    .optional();

export const gelClientTlsSecurity = (z: ZodSingleton) =>
  z
    .enum(["strict", "no_host_verification", "insecure"])
    .describe(descriptions.gelClientTlsSecurity)
    .default(defaults.gelClientTlsSecurity);

export const gelCredentialsFile = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.gelCredentialsFile)
    .min(1, { message: messages.gelCredentialsFileFormat })
    .optional();
