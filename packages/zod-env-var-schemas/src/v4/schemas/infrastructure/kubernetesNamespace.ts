import { z } from "zod";
import { KUBERNETES_NAME_PATTERN } from "../../../shared/patterns";
import {
  INFRASTRUCTURE_DEFAULTS,
  INFRASTRUCTURE_DESCRIPTIONS,
  INFRASTRUCTURE_MESSAGES,
} from "../../../shared/infrastructure";

const schema = z
  .string()
  .describe(INFRASTRUCTURE_DESCRIPTIONS.KUBERNETES_NAMESPACE)
  .regex(KUBERNETES_NAME_PATTERN, {
    error: INFRASTRUCTURE_MESSAGES.KUBERNETES_NAME_FORMAT,
  })
  .default(INFRASTRUCTURE_DEFAULTS.KUBERNETES_NAMESPACE);

export const kubernetesNamespaceSchema = schema;
export const KUBERNETES_NAMESPACE = kubernetesNamespaceSchema;
