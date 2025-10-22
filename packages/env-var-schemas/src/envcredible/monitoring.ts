import { StringEnvVarSchema, NumberEnvVarSchema, type StringEnvVarSchemaInput, type NumberEnvVarSchemaInput } from "../../../envcredible-core/src";
import { processWithZodSchema } from "@envcredible/converters";
import { z } from "zod";
import {
  descriptions,
  messages,
  defaults,
  constraints,
  patterns,
} from "../shared/infrastructure";

export const newRelicLicenseKey = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.newRelicLicenseKey,
    process: processWithZodSchema<string>(
      z.string().length(constraints.newRelicLicenseKeyLength, {
        message: messages.newRelicLicenseKeyLength,
      }),
      "string"
    ),
    secret: true,
    required: false,
    ...input,
  });

export const sentryDsn = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.sentryDsn,
    process: processWithZodSchema<string>(
      z.string().regex(patterns.sentryDsn, {
        message: messages.sentryDsnFormat,
      }),
      "string"
    ),
    secret: true,
    required: false,
    ...input,
  });

export const jaegerEndpoint = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.jaegerEndpoint,
    process: processWithZodSchema<string>(
      z.string().url({ message: messages.jaegerEndpointFormat }),
      "string"
    ),
    required: false,
    ...input,
  });

export const prometheusPort = (input: Partial<NumberEnvVarSchemaInput> = {}) =>
  new NumberEnvVarSchema({
    description: descriptions.prometheusPort,
    default: defaults.prometheusPort,
    process: processWithZodSchema<number>(
      z.coerce.number()
        .int({ message: messages.prometheusPortInt })
        .min(constraints.prometheusPortMin, { message: messages.prometheusPortMin })
        .max(constraints.prometheusPortMax, { message: messages.prometheusPortMax }),
      "number"
    ),
    ...input,
  });

export const datadogApiKey = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.datadogApiKey,
    process: processWithZodSchema<string>(
      z.string().length(constraints.datadogApiKeyLength, {
        message: messages.datadogApiKeyLength,
      }),
      "string"
    ),
    secret: true,
    required: false,
    ...input,
  });

export const NEW_RELIC_LICENSE_KEY = newRelicLicenseKey();
export const SENTRY_DSN = sentryDsn();
export const JAEGER_ENDPOINT = jaegerEndpoint();
export const PROMETHEUS_PORT = prometheusPort();
export const DATADOG_API_KEY = datadogApiKey();

export const monitoring = {
  NEW_RELIC_LICENSE_KEY,
  SENTRY_DSN,
  JAEGER_ENDPOINT,
  PROMETHEUS_PORT,
  DATADOG_API_KEY,
} as const;