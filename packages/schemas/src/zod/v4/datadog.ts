import {
  descriptions,
  messages,
  constraints,
} from "../../shared/infrastructure";
import type { ZodSingleton } from "./types";

export const datadogApiKey = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.datadogApiKey)
    .length(constraints.datadogApiKeyLength, {
      message: messages.datadogApiKeyLength,
    })
    .optional();
