import { z } from "zod";
import { HOST_PORT_LIST_PATTERN } from "../../../shared/patterns";
import { INFRASTRUCTURE_DESCRIPTIONS, INFRASTRUCTURE_MESSAGES } from "../../../shared/infrastructure";

const schema = z
  .string()
  .describe(INFRASTRUCTURE_DESCRIPTIONS.MEMCACHED_SERVERS)
  .regex(HOST_PORT_LIST_PATTERN, {
    error: INFRASTRUCTURE_MESSAGES.HOST_PORT_LIST_FORMAT,
  });

export const memcachedServersSchema = schema;
export const MEMCACHED_SERVERS = memcachedServersSchema;
