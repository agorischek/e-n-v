import { z } from "zod";
import {
  API_SERVICE_DEFAULTS,
  API_SERVICE_DESCRIPTIONS,
  API_SERVICE_LIMITS,
  API_SERVICE_MESSAGES,
} from "../../../shared/apiService";

const schema = z
  .number()
  .describe(API_SERVICE_DESCRIPTIONS.PORT)
  .int({ error: API_SERVICE_MESSAGES.PORT_INT })
  .min(API_SERVICE_LIMITS.PORT_MIN, { error: API_SERVICE_MESSAGES.PORT_MIN })
  .max(API_SERVICE_LIMITS.PORT_MAX, { error: API_SERVICE_MESSAGES.PORT_MAX })
  .default(API_SERVICE_DEFAULTS.PORT);

export const portSchema = schema;
export const PORT = portSchema;
