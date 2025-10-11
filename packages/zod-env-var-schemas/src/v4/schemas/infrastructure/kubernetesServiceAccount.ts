import { z } from "zod";
import { KUBERNETES_NAME_PATTERN } from "../../../shared/patterns";
import { INFRASTRUCTURE_DESCRIPTIONS, INFRASTRUCTURE_MESSAGES } from "../../../shared/infrastructure";

const schema = z
  .string()
  .describe(INFRASTRUCTURE_DESCRIPTIONS.KUBERNETES_SERVICE_ACCOUNT)
  .regex(KUBERNETES_NAME_PATTERN, {
    error: INFRASTRUCTURE_MESSAGES.KUBERNETES_SERVICE_ACCOUNT_FORMAT,
  })
  .optional();

export const kubernetesServiceAccountSchema = schema;
export const KUBERNETES_SERVICE_ACCOUNT = kubernetesServiceAccountSchema;
