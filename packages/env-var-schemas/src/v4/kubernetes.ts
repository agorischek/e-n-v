import { z } from "zod";
import { descriptions, messages, defaults, patterns } from "../shared/infrastructure";

export const kubernetesNamespace = () =>
  z
    .string()
    .describe(descriptions.kubernetesNamespace)
    .regex(patterns.kubernetesName, {
      message: messages.kubernetesNameFormat,
    })
    .default(defaults.kubernetesNamespace);

export const kubernetesServiceAccount = () =>
  z
    .string()
    .describe(descriptions.kubernetesServiceAccount)
    .regex(patterns.kubernetesName, {
      message: messages.kubernetesServiceAccountFormat,
    })
    .optional();

export const KUBERNETES_NAMESPACE = kubernetesNamespace();
export const KUBERNETES_SERVICE_ACCOUNT = kubernetesServiceAccount();