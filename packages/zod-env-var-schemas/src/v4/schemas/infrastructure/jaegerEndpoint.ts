import { z } from "zod";
import { INFRASTRUCTURE_DESCRIPTIONS, INFRASTRUCTURE_MESSAGES } from "../../../shared/infrastructure";

const schema = z
  .string()
  .describe(INFRASTRUCTURE_DESCRIPTIONS.JAEGER_ENDPOINT)
  .url({ error: INFRASTRUCTURE_MESSAGES.JAEGER_ENDPOINT_FORMAT })
  .optional();

export const jaegerEndpointSchema = schema;
export const JAEGER_ENDPOINT = jaegerEndpointSchema;
