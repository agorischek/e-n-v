import {
  descriptions,
  messages,
  defaults,
  constraints,
  patterns,
} from "../../shared/infrastructure";
import type { ZodSingleton } from "./types";

export const newRelicLicenseKey = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.newRelicLicenseKey)
    .length(constraints.newRelicLicenseKeyLength, {
      message: messages.newRelicLicenseKeyLength,
    })
    .optional();

export const sentryDsn = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.sentryDsn)
    .regex(patterns.sentryDsn, {
      message: messages.sentryDsnFormat,
    })
    .optional();

export const jaegerEndpoint = (z: ZodSingleton) =>
  z
    .string()
    .url({ message: messages.jaegerEndpointFormat })
    .describe(descriptions.jaegerEndpoint)
    .optional();

export const prometheusPort = (z: ZodSingleton) =>
  z
    .number()
    .describe(descriptions.prometheusPort)
    .int({ message: messages.prometheusPortInt })
    .min(constraints.prometheusPortMin, { message: messages.prometheusPortMin })
    .max(constraints.prometheusPortMax, { message: messages.prometheusPortMax })
    .default(defaults.prometheusPort);
