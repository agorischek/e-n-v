import { z } from "zod";
import {
  API_SERVICE_DEFAULTS,
  API_SERVICE_DESCRIPTIONS,
  API_SERVICE_ENUM_OPTIONS,
} from "../../../shared/apiService";

const schema = z
  .enum([...API_SERVICE_ENUM_OPTIONS.NODE_ENV])
  .describe(API_SERVICE_DESCRIPTIONS.NODE_ENV)
  .default(API_SERVICE_DEFAULTS.NODE_ENV);

export const nodeEnvSchema = schema;
export const NODE_ENV = nodeEnvSchema;
