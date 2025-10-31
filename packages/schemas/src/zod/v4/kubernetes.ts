import {
  descriptions,
  messages,
  defaults,
  patterns,
} from "../../shared/infrastructure";
import type { ZodSingleton } from "./types";

export const kubernetesNamespace = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.kubernetesNamespace)
    .regex(patterns.kubernetesName, {
      message: messages.kubernetesNameFormat,
    })
    .default(defaults.kubernetesNamespace);

export const kubernetesServiceAccount = (z: ZodSingleton) =>
  z
    .string()
    .describe(descriptions.kubernetesServiceAccount)
    .regex(patterns.kubernetesName, {
      message: messages.kubernetesServiceAccountFormat,
    })
    .optional();
