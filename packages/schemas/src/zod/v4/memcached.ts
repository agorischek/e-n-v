import { descriptions, messages, patterns } from "../../shared/infrastructure";
import type { ZodSingleton } from "./types";

export const memcachedServers = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.memcachedServers)
    .regex(patterns.hostPortList, {
      message: messages.hostPortListFormat,
    });
