import {
  StringEnvVarSchema,
  NumberEnvVarSchema,
  type StringEnvVarSchemaInput,
  type NumberEnvVarSchemaInput,
} from "@e-n-v/core";
import {
  string,
  number,
  exactLength,
  pattern,
  url,
  integer,
  between,
} from "../validation";
import {
  descriptions,
  attributes,
  defaults,
  constraints,
  patterns,
} from "../shared/infrastructure";

export const newRelicLicenseKey = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.newRelicLicenseKey,
    process: string(
      exactLength(
        constraints.newRelicLicenseKeyLength,
        attributes.newRelicLicenseKeyLength
      )
    ),
    secret: true,
    required: false,
    ...input,
  });

export const sentryDsn = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.sentryDsn,
    process: string(
      pattern(patterns.sentryDsn, attributes.sentryDsnFormat)
    ),
    secret: true,
    required: false,
    ...input,
  });

export const jaegerEndpoint = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.jaegerEndpoint,
    process: string(url(attributes.jaegerEndpointFormat)),
    required: false,
    ...input,
  });

export const prometheusPort = (input: Partial<NumberEnvVarSchemaInput> = {}) =>
  new NumberEnvVarSchema({
    description: descriptions.prometheusPort,
    default: defaults.prometheusPort,
    process: number(
      integer(attributes.prometheusPortInt),
      between(constraints.prometheusPortMin, constraints.prometheusPortMax)
    ),
    ...input,
  });

export const datadogApiKey = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.datadogApiKey,
    process: string(
      exactLength(constraints.datadogApiKeyLength, attributes.datadogApiKeyLength)
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
