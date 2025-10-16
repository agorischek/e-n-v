import { z } from "zod";
import {
  constraints,
  defaults,
  descriptions,
  messages,
} from "../shared/apiService";

export const rateLimitRpm = () =>
  z
    .number()
    .describe(descriptions.rateLimitRpm)
    .int({ error: messages.rateLimitRpmInt })
    .min(constraints.rateLimitRpmMin, { error: messages.rateLimitRpmMin })
    .max(constraints.rateLimitRpmMax, { error: messages.rateLimitRpmMax })
    .default(defaults.rateLimitRpm);

export const rateLimitWindow = () =>
  z
    .number()
    .describe(descriptions.rateLimitWindow)
    .int({ error: messages.rateLimitWindowInt })
    .min(constraints.rateLimitWindowMin, { error: messages.rateLimitWindowMin })
    .max(constraints.rateLimitWindowMax, { error: messages.rateLimitWindowMax })
    .default(defaults.rateLimitWindow);

export const RATE_LIMIT_RPM = rateLimitRpm();
export const RATE_LIMIT_WINDOW = rateLimitWindow();
