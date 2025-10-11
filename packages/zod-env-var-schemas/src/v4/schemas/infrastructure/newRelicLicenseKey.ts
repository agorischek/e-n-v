import { z } from "zod";
import {
  INFRASTRUCTURE_DESCRIPTIONS,
  INFRASTRUCTURE_LIMITS,
  INFRASTRUCTURE_MESSAGES,
} from "../../../shared/infrastructure";

const schema = z
  .string()
  .describe(INFRASTRUCTURE_DESCRIPTIONS.NEW_RELIC_LICENSE_KEY)
  .length(INFRASTRUCTURE_LIMITS.NEW_RELIC_LICENSE_KEY_LENGTH, {
    error: INFRASTRUCTURE_MESSAGES.NEW_RELIC_LICENSE_KEY_LENGTH,
  })
  .optional();

export const newRelicLicenseKeySchema = schema;
export const NEW_RELIC_LICENSE_KEY = newRelicLicenseKeySchema;
