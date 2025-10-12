import { z } from "zod";
import { INFRASTRUCTURE_DESCRIPTIONS, INFRASTRUCTURE_MESSAGES } from "../../../shared/infrastructure";

const schema = z
  .url({ message: INFRASTRUCTURE_MESSAGES.JAEGER_ENDPOINT_FORMAT })
  .describe(INFRASTRUCTURE_DESCRIPTIONS.JAEGER_ENDPOINT)
  .optional();

export const jaegerEndpointSchema = schema;
export const JAEGER_ENDPOINT = jaegerEndpointSchema;
