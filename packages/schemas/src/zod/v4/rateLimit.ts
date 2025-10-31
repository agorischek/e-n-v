import {
  constraints,
  defaults,
  descriptions,
  messages,
} from "../../shared/apiService";
import type { ZodSingleton } from "./types";

export const rateLimitRpm = (z: ZodSingleton) =>
  z.coerce
    .number()
    .describe(descriptions.rateLimitRpm)
    .int({ error: messages.rateLimitRpmInt })
    .min(constraints.rateLimitRpmMin, { error: messages.rateLimitRpmMin })
    .max(constraints.rateLimitRpmMax, { error: messages.rateLimitRpmMax })
    .default(defaults.rateLimitRpm);

export const rateLimitWindow = (z: ZodSingleton) =>
  z.coerce
    .number()
    .describe(descriptions.rateLimitWindow)
    .int({ error: messages.rateLimitWindowInt })
    .min(constraints.rateLimitWindowMin, { error: messages.rateLimitWindowMin })
    .max(constraints.rateLimitWindowMax, { error: messages.rateLimitWindowMax })
    .default(defaults.rateLimitWindow);
