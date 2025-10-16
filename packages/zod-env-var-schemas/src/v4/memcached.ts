import { z } from "zod";
import { descriptions, messages, patterns } from "../shared/infrastructure";

export const memcachedServers = () =>
  z
    .string()
    .describe(descriptions.memcachedServers)
    .regex(patterns.hostPortList, {
      message: messages.hostPortListFormat,
    });

export const MEMCACHED_SERVERS = memcachedServers();
