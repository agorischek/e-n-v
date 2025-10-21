import { z } from "zod";
import {
  descriptions,
  messages,
  defaults,
  constraints,
  patterns,
} from "../shared/infrastructure";

export const newRelicLicenseKey = () =>
  z
    .string()
    .describe(descriptions.newRelicLicenseKey)
    .length(constraints.newRelicLicenseKeyLength, {
      message: messages.newRelicLicenseKeyLength,
    })
    .optional();

export const sentryDsn = () =>
  z
    .string()
    .describe(descriptions.sentryDsn)
    .regex(patterns.sentryDsn, {
      message: messages.sentryDsnFormat,
    })
    .optional();

export const jaegerEndpoint = () =>
  z
    .string()
    .url({ message: messages.jaegerEndpointFormat })
    .describe(descriptions.jaegerEndpoint)
    .optional();

export const prometheusPort = () =>
  z
    .number()
    .describe(descriptions.prometheusPort)
    .int({ message: messages.prometheusPortInt })
    .min(constraints.prometheusPortMin, { message: messages.prometheusPortMin })
    .max(constraints.prometheusPortMax, { message: messages.prometheusPortMax })
    .default(defaults.prometheusPort);

export const NEW_RELIC_LICENSE_KEY = newRelicLicenseKey();
export const SENTRY_DSN = sentryDsn();
export const JAEGER_ENDPOINT = jaegerEndpoint();
export const PROMETHEUS_PORT = prometheusPort();
