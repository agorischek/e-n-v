import { patterns } from "../../shared/apiService";
import {
  constraints,
  defaults,
  descriptions,
  messages,
} from "../../shared/apiService";
import type { ZodSingleton } from "./types";

export const apiKey = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.apiKey)
    .min(constraints.apiKeyMinLength, { error: messages.apiKeyMin });

export const apiBaseUrl = (z: ZodSingleton) =>
  z
    .url()
    .describe(descriptions.apiBaseUrl)
    .regex(patterns.httpProtocol, { error: messages.httpProtocolRequired });

export const apiTimeout = (z: ZodSingleton) =>
  z
    .number()
    .describe(descriptions.apiTimeout)
    .int({ error: messages.apiTimeoutInt })
    .min(constraints.apiTimeoutMin, { error: messages.apiTimeoutMin })
    .max(constraints.apiTimeoutMax, { error: messages.apiTimeoutMax })
    .default(defaults.apiTimeout);
