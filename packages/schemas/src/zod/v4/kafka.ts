import { descriptions, messages } from "../../shared/infrastructure";
import { patterns } from "../../shared/infrastructure";
import type { ZodSingleton } from "./types";

export const kafkaBrokers = (z: ZodSingleton) =>
  z.string().describe(descriptions.kafkaBrokers).regex(patterns.hostPortList, {
    message: messages.hostPortListFormat,
  });

export const kafkaClientId = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.kafkaClientId)
    .min(1, { message: messages.kafkaClientIdRequired });
