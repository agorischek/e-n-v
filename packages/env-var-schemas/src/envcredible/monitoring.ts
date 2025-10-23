import { StringEnvVarSchema, NumberEnvVarSchema, type StringEnvVarSchemaInput, type NumberEnvVarSchemaInput } from "../../../envcredible-core/src";
import { createZodProcessor } from "../helpers/zodHelpers";
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
    process: createZodProcessor(
      z.string().length(constraints.newRelicLicenseKeyLength, {
        message: messages.newRelicLicenseKeyLength,
      }),
    ),
    secret: true,
    required: false,
    ...input,
  });

export const sentryDsn = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.sentryDsn,
    process: createZodProcessor(
      z.string().regex(patterns.sentryDsn, {
        message: messages.sentryDsnFormat,
      }),
    ),
    secret: true,
    required: false,
    ...input,
  });

export const jaegerEndpoint = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.jaegerEndpoint,
    process: createZodProcessor(
      z.string().url({ message: messages.jaegerEndpointFormat }),
    ),
    required: false,
    ...input,
  });

export const prometheusPort = (input: Partial<NumberEnvVarSchemaInput> = {}) =>
  new NumberEnvVarSchema({
    description: descriptions.prometheusPort,
    default: defaults.prometheusPort,
    process: createZodProcessor(
      z.coerce.number()
        .int({ message: messages.prometheusPortInt })
        .min(constraints.prometheusPortMin, { message: messages.prometheusPortMin })
        .max(constraints.prometheusPortMax, { message: messages.prometheusPortMax }),
    ),
    ...input,
  });

export const datadogApiKey = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.datadogApiKey,
    process: createZodProcessor(
      z.string().length(constraints.datadogApiKeyLength, {
        message: messages.datadogApiKeyLength,
      }),
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